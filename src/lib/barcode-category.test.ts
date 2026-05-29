import { describe, expect, it } from "vitest";
import { mapCategoryTagsToCategoryId } from "./barcode-category";
import { categorySeedData } from "@/db/categories";

const ID = Object.fromEntries(categorySeedData.map((c) => [c.name, c.id]));

describe("mapCategoryTagsToCategoryId", () => {
  it("maps straightforward food categories", () => {
    expect(mapCategoryTagsToCategoryId(["dairies", "yogurts"])).toBe(ID["Dairy"]);
    expect(mapCategoryTagsToCategoryId(["beverages", "sodas", "carbonated drinks"])).toBe(ID["Beverages"]);
    expect(mapCategoryTagsToCategoryId(["meats", "poultry"])).toBe(ID["Meat"]);
    expect(mapCategoryTagsToCategoryId(["vegetables", "fresh foods"])).toBe(ID["Produce"]);
    expect(mapCategoryTagsToCategoryId(["breads", "bakery products"])).toBe(ID["Bakery"]);
    expect(mapCategoryTagsToCategoryId(["pastas", "cereals"])).toBe(ID["Grains & Pasta"]);
  });

  it("lets preservation state win over food type for shelf-life accuracy", () => {
    expect(mapCategoryTagsToCategoryId(["frozen foods", "vegetables", "frozen vegetables"])).toBe(ID["Frozen"]);
    expect(mapCategoryTagsToCategoryId(["canned foods", "canned vegetables", "tomatoes"])).toBe(ID["Canned"]);
  });

  it("does not let a sweet treat read as dairy just because it mentions milk", () => {
    expect(
      mapCategoryTagsToCategoryId(["chocolates", "sweet snacks", "snacks", "milk chocolates"])
    ).toBe(ID["Snacks"]);
  });

  it("does not match substrings inside unrelated words", () => {
    // "tea" is inside "steaks"; "oil" is inside "boiled" — neither should match.
    expect(mapCategoryTagsToCategoryId(["steaks", "boiled foods"])).not.toBe(ID["Beverages"]);
    expect(mapCategoryTagsToCategoryId(["boiled foods"])).not.toBe(ID["Condiments"]);
  });

  it("returns null when no rule matches", () => {
    expect(mapCategoryTagsToCategoryId(["plant based foods", "groceries"])).toBeNull();
    expect(mapCategoryTagsToCategoryId([])).toBeNull();
  });

  it("only ever returns ids that exist in the category seed data", () => {
    const validIds = new Set<number>(categorySeedData.map((c) => c.id));
    const samples = [
      ["frozen foods"],
      ["canned vegetables"],
      ["cheese"],
      ["beef"],
      ["fruits"],
      ["croissant"],
      ["fruit juices"],
      ["rice"],
      ["olive oils", "condiments"],
      ["chocolates"],
    ];
    for (const tags of samples) {
      const id = mapCategoryTagsToCategoryId(tags);
      expect(id === null || validIds.has(id)).toBe(true);
    }
  });
});
