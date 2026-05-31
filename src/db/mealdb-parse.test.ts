import { describe, expect, it } from "vitest";
import { collectIngredients, parseMeal, parseMeasure, type RawMeal } from "./mealdb-parse";

function buildMeal(overrides: RawMeal = {}): RawMeal {
  return {
    idMeal: "52772",
    strMeal: "Teriyaki Chicken Casserole",
    strCategory: "Chicken",
    strArea: "Japanese",
    strInstructions: "Preheat oven to 350. Cook the chicken. Combine and bake until done.",
    strMealThumb: "https://www.themealdb.com/images/media/meals/teriyaki.jpg",
    strSource: "https://example.com/teriyaki",
    strIngredient1: "Chicken",
    strMeasure1: "3/4 cup",
    strIngredient2: "Soy Sauce",
    strMeasure2: "1/2 cup",
    strIngredient3: "",
    strMeasure3: "",
    ...overrides,
  };
}

describe("parseMeasure", () => {
  it("parses whole, fractional, and mixed quantities", () => {
    expect(parseMeasure("1 1/2 cups")).toEqual({ quantity: 1.5, unit: "cups" });
    expect(parseMeasure("1/2 cup")).toEqual({ quantity: 0.5, unit: "cup" });
    expect(parseMeasure("2 tbsp")).toEqual({ quantity: 2, unit: "tbsp" });
    expect(parseMeasure("200g")).toEqual({ quantity: 200, unit: "g" });
  });

  it("keeps unparseable amounts as unit text", () => {
    expect(parseMeasure("Pinch")).toEqual({ quantity: null, unit: "Pinch" });
    expect(parseMeasure("to taste")).toEqual({ quantity: null, unit: "to taste" });
    expect(parseMeasure("")).toEqual({ quantity: null, unit: null });
    expect(parseMeasure(undefined)).toEqual({ quantity: null, unit: null });
  });
});

describe("collectIngredients", () => {
  it("collects only the filled ingredient slots", () => {
    const ingredients = collectIngredients(buildMeal());
    expect(ingredients).toEqual([
      { ingredientName: "Chicken", quantity: 0.75, unit: "cup" },
      { ingredientName: "Soy Sauce", quantity: 0.5, unit: "cup" },
    ]);
  });
});

describe("parseMeal", () => {
  it("parses a complete meal into a global recipe", () => {
    const recipe = parseMeal(buildMeal());
    expect(recipe).not.toBeNull();
    expect(recipe).toMatchObject({
      externalId: "mealdb:52772",
      name: "Teriyaki Chicken Casserole",
      cuisine: "Japanese",
      category: "Chicken",
      sourceUrl: "https://example.com/teriyaki",
    });
    expect(recipe?.ingredients).toHaveLength(2);
    expect(recipe?.description).toBeTruthy();
  });

  it("falls back to a TheMealDB URL when no source is given", () => {
    const recipe = parseMeal(buildMeal({ strSource: "" }));
    expect(recipe?.sourceUrl).toBe("https://www.themealdb.com/meal/52772");
  });

  it("treats an Unknown area as no cuisine", () => {
    expect(parseMeal(buildMeal({ strArea: "Unknown" }))?.cuisine).toBeNull();
  });

  it("rejects meals failing the quality gate", () => {
    expect(parseMeal(buildMeal({ strInstructions: "" }))).toBeNull();
    expect(parseMeal(buildMeal({ strMealThumb: "" }))).toBeNull();
    expect(parseMeal(buildMeal({ strIngredient2: "", strMeasure2: "" }))).toBeNull(); // only 1 ingredient
  });
});
