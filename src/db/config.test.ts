import { describe, expect, it } from "vitest";
import { resolveDatabasePoolMax, resolveDatabaseUrl } from "./config";

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

describe("resolveDatabasePoolMax", () => {
  it("defaults to five connections and caps configured pools", () => {
    expect(resolveDatabasePoolMax({})).toBe(5);
    expect(resolveDatabasePoolMax({ DATABASE_POOL_MAX: "12" })).toBe(12);
    expect(resolveDatabasePoolMax({ DATABASE_POOL_MAX: "200" })).toBe(20);
    expect(resolveDatabasePoolMax({ DATABASE_POOL_MAX: "invalid" })).toBe(5);
    expect(resolveDatabasePoolMax({ DATABASE_POOL_MAX: "0" })).toBe(5);
  });
});
