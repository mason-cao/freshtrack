import { sql } from "drizzle-orm";
import { closeDb, db } from "./index";
import * as schema from "./schema";
import { categorySeedData } from "./categories";
import { getDemoData } from "./demo-data";
import { assertCanRunDestructiveSeed } from "./seed-safety";

const DEV_USER_ID = "dev-user-local";
const DEV_USER_EMAIL = "dev@freshtrack.local";

async function main() {
  assertCanRunDestructiveSeed();
  console.log("Seeding database...");
  const { itemsData, recipesData, wasteLogData } = getDemoData();

  await db.delete(schema.wasteLog);
  await db.delete(schema.recipeIngredients);
  await db.delete(schema.recipes);
  await db.delete(schema.items);
  await db.delete(schema.accounts);
  await db.delete(schema.sessions);
  await db.delete(schema.verificationTokens);
  await db.delete(schema.users);
  await db.delete(schema.categories);

  await db
    .insert(schema.users)
    .values({
      id: DEV_USER_ID,
      name: "FreshTrack Dev",
      email: DEV_USER_EMAIL,
      image: null,
    });

  console.log(`  ✓ Dev user seeded (${DEV_USER_EMAIL})`);

  for (const cat of categorySeedData) {
    await db.insert(schema.categories).values(cat);
  }

  await db.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('categories', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM categories),
      true
    )
  `);

  console.log("  ✓ Categories seeded");

  for (const item of itemsData) {
    await db.insert(schema.items).values({
      ...item,
      userId: DEV_USER_ID,
      status: "active",
    });
  }

  console.log("  ✓ Items seeded");

  for (const recipe of recipesData) {
    const { ingredients, ...recipeRow } = recipe;
    const [result] = await db
      .insert(schema.recipes)
      .values({ ...recipeRow, userId: DEV_USER_ID })
      .returning();
    for (const ing of ingredients) {
      await db.insert(schema.recipeIngredients)
        .values({ ...ing, recipeId: result.id });
    }
  }

  console.log("  ✓ Recipes seeded");

  for (const entry of wasteLogData) {
    await db
      .insert(schema.wasteLog)
      .values({ ...entry, userId: DEV_USER_ID });
  }

  console.log("  ✓ Waste log seeded");
  console.log("Done! Database seeded successfully.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
