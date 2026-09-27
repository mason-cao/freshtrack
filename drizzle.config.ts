import { defineConfig } from "drizzle-kit";
import { loadLocalEnv } from "./src/db/load-local-env";

loadLocalEnv();

function databaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return "postgres://postgres:postgres@localhost:5432/freshtrack";
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl(),
  },
});
