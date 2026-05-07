import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./config";

describe("resolveDatabaseUrl", () => {
  it("uses DATABASE_URL when it is provided", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "postgres://user:pass@host:5432/freshtrack",
        NODE_ENV: "production",
      })
    ).toBe("postgres://user:pass@host:5432/freshtrack");
  });

  it("uses a local Postgres fallback outside production", () => {
    expect(resolveDatabaseUrl({ NODE_ENV: "development" })).toBe(
      "postgres://postgres:postgres@localhost:5432/freshtrack"
    );
  });

  it("requires DATABASE_URL in production", () => {
    expect(() => resolveDatabaseUrl({ NODE_ENV: "production" })).toThrow(
      "DATABASE_URL is required"
    );
  });
});
