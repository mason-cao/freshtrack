import { describe, expect, it } from "vitest";
import { starterRecipeSeedData } from "./starter-recipes";

describe("starterRecipeSeedData", () => {
  it("defines production starter recipes with stable ids", () => {
    expect(starterRecipeSeedData.length).toBeGreaterThanOrEqual(8);
    expect(starterRecipeSeedData.map((recipe) => recipe.id)).toEqual(
      Array.from(
        { length: starterRecipeSeedData.length },
        (_, index) => index + 1
      )
    );
  });

  it("defines complete recipe and ingredient metadata", () => {
    for (const recipe of starterRecipeSeedData) {
      expect(recipe.name.trim()).not.toBe("");
      expect(recipe.description.trim()).not.toBe("");
      expect(recipe.instructions.trim()).not.toBe("");
      expect(recipe.prepTimeMinutes + recipe.cookTimeMinutes).toBeGreaterThan(0);
      expect(recipe.servings).toBeGreaterThan(0);
      expect(recipe.ingredients.length).toBeGreaterThanOrEqual(2);

      for (const ingredient of recipe.ingredients) {
        expect(ingredient.ingredientName.trim()).not.toBe("");
        expect(ingredient.quantity).toBeGreaterThan(0);
        expect(ingredient.unit.trim()).not.toBe("");
      }
    }
  });
});
