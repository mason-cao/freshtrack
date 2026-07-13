// One-time bulk import of TheMealDB's free catalog into our recipes tables.
// Idempotent: recipes are upserted on externalId and their ingredient rows are
// replaced, so re-running doesn't duplicate. Production-safe — no destructive
// reset, recipes are inserted as global (userId: null). Requires the
// external_id unique constraint (migration 0003) to be applied first.
//
//   npm run db:import:recipes

import { eq } from "drizzle-orm";
import { closeDb, db } from "./index";
import * as schema from "./schema";
import { parseMeal, type ParsedRecipe, type RawMeal } from "./mealdb-parse";
import { readLimitedJsonBody } from "../lib/request-body";

const SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php?f=";
const USER_AGENT = "FreshTrack/1.0 (https://freshtrack.up.railway.app)";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX_MEALDB_RESPONSE_BYTES = 2 * 1024 * 1024;

async function fetchMealsForLetter(letter: string): Promise<RawMeal[]> {
  try {
    const response = await fetch(`${SEARCH_URL}${letter}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return [];
    const result = await readLimitedJsonBody(response, MAX_MEALDB_RESPONSE_BYTES);
    const data = (result.ok ? result.body : null) as {
      meals?: RawMeal[] | null;
    } | null;
    return Array.isArray(data?.meals) ? data.meals : [];
  } catch {
    return [];
  }
}

async function upsertRecipe(parsed: ParsedRecipe): Promise<void> {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(schema.recipes)
      .values({
        userId: null,
        name: parsed.name,
        description: parsed.description,
        instructions: parsed.instructions,
        prepTimeMinutes: null,
        cookTimeMinutes: null,
        servings: null,
        imageUrl: parsed.imageUrl,
        cuisine: parsed.cuisine,
        category: parsed.category,
        sourceUrl: parsed.sourceUrl,
        externalId: parsed.externalId,
      })
      .onConflictDoUpdate({
        target: schema.recipes.externalId,
        set: {
          userId: null,
          name: parsed.name,
          description: parsed.description,
          instructions: parsed.instructions,
          imageUrl: parsed.imageUrl,
          cuisine: parsed.cuisine,
          category: parsed.category,
          sourceUrl: parsed.sourceUrl,
        },
      })
      .returning({ id: schema.recipes.id });

    // Replace ingredients atomically so an interrupted import cannot leave a
    // recipe without its ingredient rows.
    await tx
      .delete(schema.recipeIngredients)
      .where(eq(schema.recipeIngredients.recipeId, row.id));
    await tx.insert(schema.recipeIngredients).values(
      parsed.ingredients.map((ingredient) => ({
        recipeId: row.id,
        ingredientName: ingredient.ingredientName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))
    );
  });
}

async function main() {
  console.log("Importing recipes from TheMealDB…");
  const seen = new Set<string>();
  let imported = 0;
  let skipped = 0;

  for (const letter of LETTERS) {
    const meals = await fetchMealsForLetter(letter);
    for (const meal of meals) {
      const id = (meal.idMeal ?? "").trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const parsed = parseMeal(meal);
      if (!parsed) {
        skipped++;
        continue;
      }
      await upsertRecipe(parsed);
      imported++;
    }
    // Be polite to the free API between requests.
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  console.log(`Done. Imported ${imported} recipes (${skipped} skipped by the quality gate).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
