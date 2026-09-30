// Applies pending migrations from ./drizzle. Railway runs this as the
// pre-deploy command (see railway.json), so the schema is current before new
// code serves traffic; a failure stops the deploy. Uses drizzle-orm's migrator
// rather than drizzle-kit, which is a dev dependency.
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required to run migrations.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1, prepare: false, connect_timeout: 10, onnotice: () => {} });
try {
  await migrate(drizzle(sql), {
    migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
  });
  console.log("Database migrations are up to date.");
} finally {
  await sql.end();
}
