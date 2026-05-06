import { describe, expect, it } from "vitest";
import { categorySeedData } from "./categories";

describe("categorySeedData", () => {
  it("defines stable global category ids for production seeding", () => {
    expect(categorySeedData).toHaveLength(10);
    expect(categorySeedData.map((category) => category.id)).toEqual(
      Array.from({ length: 10 }, (_, index) => index + 1)
    );
  });

  it("defines complete category metadata", () => {
    for (const category of categorySeedData) {
      expect(category.name.trim()).not.toBe("");
      expect(category.icon.trim()).not.toBe("");
      expect(category.defaultShelfLifeDays).toBeGreaterThan(0);
    }
  });
});
