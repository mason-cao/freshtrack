const LOCAL_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/freshtrack";

type DatabaseEnv = Partial<
  Pick<NodeJS.ProcessEnv, "DATABASE_URL" | "DATABASE_POOL_MAX" | "NODE_ENV">
>;

export function resolveDatabaseUrl(env: DatabaseEnv = process.env): string {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (databaseUrl) return databaseUrl;

  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return LOCAL_DATABASE_URL;
}

export function resolveDatabasePoolMax(env: DatabaseEnv = process.env): number {
  const configured = Number(env.DATABASE_POOL_MAX);
  if (!Number.isSafeInteger(configured) || configured < 1) return 5;
  return Math.min(configured, 20);
}
