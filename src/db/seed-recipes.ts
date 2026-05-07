import { eq, sql } from "drizzle-orm";
import { closeDb, db } from "./index";
import { starterRecipeSeedData } from "./starter-recipes";
import * as schema from "./schema";

async function main() {
  console.log("Seeding global starter recipes...");

  for (const recipe of starterRecipeSeedData) {
    await db
      .insert(schema.recipes)
      .values({
        id: recipe.id,
        userId: null,
        name: recipe.name,
        description: recipe.description,
        instructions: recipe.instructions,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        servings: recipe.servings,
      })
      .onConflictDoUpdate({
        target: schema.recipes.id,
        set: {
          userId: null,
          name: recipe.name,
          description: recipe.description,
          instructions: recipe.instructions,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          servings: recipe.servings,
        },
      });

    await db
      .delete(schema.recipeIngredients)
      .where(eq(schema.recipeIngredients.recipeId, recipe.id));

    await db.insert(schema.recipeIngredients).values(
      recipe.ingredients.map((ingredient) => ({
        recipeId: recipe.id,
        ingredientName: ingredient.ingredientName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))
    );
  }

  await db.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('recipes', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM recipes),
      true
    )
  `);

  await db.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('recipe_ingredients', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM recipe_ingredients),
      true
    )
  `);

  console.log(`Done. Seeded ${starterRecipeSeedData.length} global recipes.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
