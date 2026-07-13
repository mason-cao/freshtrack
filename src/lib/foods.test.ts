import { describe, expect, it } from "vitest";
import { foods, getFoodBySlug, getRelatedFoods } from "./foods";

describe("food guide data integrity", () => {
  it("uses unique, URL-safe slugs", () => {
    const slugs = foods.map((food) => food.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("only links to known related guides", () => {
    for (const food of foods) {
      for (const relatedSlug of food.relatedFoods) {
        expect(getFoodBySlug(relatedSlug), `${food.slug} -> ${relatedSlug}`).toBeDefined();
      }
      expect(getRelatedFoods(food.slug)).toHaveLength(food.relatedFoods.length);
    }
  });

  it("keeps required guidance and HTTPS sources on every guide", () => {
    for (const food of foods) {
      expect(food.shelfLife.length, food.slug).toBeGreaterThan(0);
      expect(food.storageTips.length, food.slug).toBeGreaterThan(0);
      expect(food.spoilageSigns.length, food.slug).toBeGreaterThan(0);
      expect(food.faqs.length, food.slug).toBeGreaterThan(0);
      expect(food.recipeMatchIngredients.length, food.slug).toBeGreaterThan(0);
      expect(food.sources.length, food.slug).toBeGreaterThan(0);
      for (const source of food.sources) {
        expect(new URL(source.url).protocol, `${food.slug}: ${source.url}`).toBe("https:");
      }
    }
  });
});
