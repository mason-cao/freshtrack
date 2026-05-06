const LOCAL_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/freshtrack";

type DatabaseEnv = Partial<Pick<NodeJS.ProcessEnv, "DATABASE_URL" | "NODE_ENV">>;

export function resolveDatabaseUrl(env: DatabaseEnv = process.env): string {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (databaseUrl) return databaseUrl;

  if (env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return LOCAL_DATABASE_URL;
}
