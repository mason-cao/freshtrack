import { describe, expect, it } from "vitest";
import {
  countExpiringMatches,
  ingredientSearchTokens,
  normalizeIngredientName,
} from "./recipe-matching";

describe("normalizeIngredientName", () => {
  it("strips quantities, units, fillers, and punctuation, then singularizes", () => {
    expect(normalizeIngredientName("2 cups fresh Spinach, chopped")).toBe("spinach");
    expect(normalizeIngredientName("1/2 lb boneless chicken breasts")).toBe("chicken breast");
    expect(normalizeIngredientName("Eggs")).toBe("egg");
    expect(normalizeIngredientName("Tomatoes")).toBe("tomato");
    expect(normalizeIngredientName("Strawberries")).toBe("strawberry");
    expect(normalizeIngredientName("Salt to taste")).toBe("salt");
    expect(normalizeIngredientName("Chicken (boneless)")).toBe("chicken");
  });
});

describe("countExpiringMatches", () => {
  it("matches on a shared meaningful token, regardless of word order", () => {
    const result = countExpiringMatches(
      ["Boneless Chicken Breast", "Olive Oil", "Salt"],
      ["chicken thighs"]
    );
    expect(result.matchCount).toBe(1);
    expect(result.matchingIngredients).toEqual(["Boneless Chicken Breast"]);
  });

  it("treats plural and descriptor variants as the same ingredient", () => {
    expect(countExpiringMatches(["Fresh Spinach"], ["Baby Spinach"]).matchCount).toBe(1);
    expect(countExpiringMatches(["Whole Milk"], ["milk"]).matchCount).toBe(1);
  });

  it("does not match substrings of unrelated words", () => {
    expect(countExpiringMatches(["Eggplant"], ["eggs"]).matchCount).toBe(0);
    expect(countExpiringMatches(["Rice"], ["ice cream"]).matchCount).toBe(0);
  });

  it("does not match on a shared weak token alone", () => {
    expect(countExpiringMatches(["Garlic Powder"], ["Chili Powder"]).matchCount).toBe(0);
  });

  it("returns zero matches when there are no expiring items", () => {
    expect(countExpiringMatches(["Chicken", "Rice"], [])).toEqual({
      matchCount: 0,
      matchingIngredients: [],
    });
  });
});

describe("ingredientSearchTokens", () => {
  it("returns normalized unique tokens suitable for coarse SQL prefilters", () => {
    expect(ingredientSearchTokens(["Fresh Tomatoes", "olive oil", "tomato slices"])).toEqual([
      "tomato",
      "olive",
      "oil",
    ]);
  });
});
