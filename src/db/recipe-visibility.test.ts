import { describe, expect, it } from "vitest";
import { isVisibleRecipeOwner } from "./recipe-visibility";

describe("isVisibleRecipeOwner", () => {
  it("allows global recipes", () => {
    expect(isVisibleRecipeOwner(null, "user-1")).toBe(true);
  });

  it("allows recipes owned by the current user", () => {
    expect(isVisibleRecipeOwner("user-1", "user-1")).toBe(true);
  });

  it("excludes recipes owned by another user", () => {
    expect(isVisibleRecipeOwner("user-2", "user-1")).toBe(false);
  });
});
