import { sql } from "drizzle-orm";
import { categorySeedData } from "./categories";
import { closeDb, db } from "./index";
import * as schema from "./schema";

async function main() {
  console.log("Seeding global categories...");

  for (const category of categorySeedData) {
    await db
      .insert(schema.categories)
      .values(category)
      .onConflictDoUpdate({
        target: schema.categories.id,
        set: {
          name: category.name,
          icon: category.icon,
          defaultShelfLifeDays: category.defaultShelfLifeDays,
        },
      });
  }

  await db.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('categories', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM categories),
      true
    )
  `);

  console.log(`Done. Seeded ${categorySeedData.length} global categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
