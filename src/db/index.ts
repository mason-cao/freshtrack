import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { resolveDatabaseUrl } from "./config";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  freshtrackSqlClient?: postgres.Sql;
};

export const sqlClient =
  globalForDb.freshtrackSqlClient ??
  postgres(resolveDatabaseUrl(), {
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.freshtrackSqlClient = sqlClient;
}

export const db = drizzle(sqlClient, { schema });

export async function closeDb() {
  await sqlClient.end();
}
