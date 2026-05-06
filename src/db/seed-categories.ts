import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { categorySeedData } from "./categories";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/freshtrack.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

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
      })
      .run();
  }

  console.log(`Done. Seeded ${categorySeedData.length} global categories.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
