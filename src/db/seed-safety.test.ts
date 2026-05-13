import { describe, expect, it } from "vitest";
import { assertCanRunDestructiveSeed } from "./seed-safety";

describe("assertCanRunDestructiveSeed", () => {
  it("blocks destructive seed in production", () => {
    expect(() =>
      assertCanRunDestructiveSeed({
        NODE_ENV: "production",
        ALLOW_DESTRUCTIVE_SEED: "1",
      })
    ).toThrow("Refusing to run destructive seed in production.");
  });

  it("requires an explicit opt-in outside production", () => {
    expect(() => assertCanRunDestructiveSeed({ NODE_ENV: "development" })).toThrow(
      "Set ALLOW_DESTRUCTIVE_SEED=1 to run the destructive dev seed."
    );
  });

  it("allows destructive seed only for non-production opt-in", () => {
    expect(() =>
      assertCanRunDestructiveSeed({
        NODE_ENV: "development",
        ALLOW_DESTRUCTIVE_SEED: "1",
      })
    ).not.toThrow();
  });
});
