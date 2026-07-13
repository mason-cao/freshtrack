import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { resolveDatabasePoolMax, resolveDatabaseUrl } from "./config";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  freshtrackSqlClient?: postgres.Sql;
};

export const sqlClient =
  globalForDb.freshtrackSqlClient ??
  postgres(resolveDatabaseUrl(), {
    prepare: false,
    max: resolveDatabasePoolMax(),
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 30 * 60,
  });

globalForDb.freshtrackSqlClient = sqlClient;

export const db = drizzle(sqlClient, { schema });

export async function closeDb() {
  await sqlClient.end();
}
