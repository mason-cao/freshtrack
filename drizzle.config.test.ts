import { afterEach, describe, expect, it, vi } from "vitest";

describe("drizzle config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("requires DATABASE_URL in production", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();

    await expect(import("./drizzle.config")).rejects.toThrow(
      "DATABASE_URL is required in production."
    );
  });
});
