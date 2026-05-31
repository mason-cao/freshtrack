import { describe, expect, it } from "vitest";
import { parseRecipeQuery, rankRecipes } from "./recipe-query";

function query(search: string): URLSearchParams {
  return new URLSearchParams(search);
}

describe("parseRecipeQuery", () => {
  it("parses and trims all supported params", () => {
    expect(
      parseRecipeQuery(query("search=  pasta &cuisine=Italian&category=Seafood&maxMinutes=30&sort=name"))
    ).toEqual({
      search: "pasta",
      cuisine: "Italian",
      category: "Seafood",
      maxMinutes: 30,
      sort: "name",
    });
  });

  it("defaults to relevance sort and nulls out empty or invalid values", () => {
    expect(parseRecipeQuery(query(""))).toEqual({
      search: null,
      cuisine: null,
      category: null,
      maxMinutes: null,
      sort: "relevance",
    });
    expect(parseRecipeQuery(query("maxMinutes=0&search=%20%20&sort=bogus")).maxMinutes).toBeNull();
    expect(parseRecipeQuery(query("maxMinutes=abc")).maxMinutes).toBeNull();
    expect(parseRecipeQuery(query("sort=bogus")).sort).toBe("relevance");
  });
});

describe("rankRecipes", () => {
  const recipes = [
    { name: "Beef Stew", prepTimeMinutes: 20, cookTimeMinutes: 90, matchCount: 0 },
    { name: "Avocado Toast", prepTimeMinutes: 5, cookTimeMinutes: 5, matchCount: 2 },
    { name: "Imported Curry", prepTimeMinutes: null, cookTimeMinutes: null, matchCount: 1 },
  ];

  it("orders by match count then name for relevance", () => {
    const ordered = rankRecipes(recipes, { maxMinutes: null, sort: "relevance" });
    expect(ordered.map((r) => r.name)).toEqual(["Avocado Toast", "Imported Curry", "Beef Stew"]);
  });

  it("orders alphabetically for name sort", () => {
    const ordered = rankRecipes(recipes, { maxMinutes: null, sort: "name" });
    expect(ordered.map((r) => r.name)).toEqual(["Avocado Toast", "Beef Stew", "Imported Curry"]);
  });

  it("drops recipes over the time limit but keeps those with unknown time", () => {
    const ordered = rankRecipes(recipes, { maxMinutes: 30, sort: "relevance" });
    // Beef Stew (110 min) is dropped; the unknown-time curry is kept.
    expect(ordered.map((r) => r.name)).toEqual(["Avocado Toast", "Imported Curry"]);
  });
});
