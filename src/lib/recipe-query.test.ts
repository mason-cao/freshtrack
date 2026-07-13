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
      offset: 0,
    });
  });

  it("defaults to relevance sort and nulls out empty or invalid values", () => {
    expect(parseRecipeQuery(query(""))).toEqual({
      search: null,
      cuisine: null,
      category: null,
      maxMinutes: null,
      sort: "relevance",
      offset: 0,
    });
    expect(parseRecipeQuery(query("maxMinutes=0&search=%20%20&sort=bogus")).maxMinutes).toBeNull();
    expect(parseRecipeQuery(query("maxMinutes=abc")).maxMinutes).toBeNull();
    expect(parseRecipeQuery(query("sort=bogus")).sort).toBe("relevance");
  });

  it("parses a non-negative result offset for progressive loading", () => {
    expect(parseRecipeQuery(query("offset=80")).offset).toBe(80);
    expect(parseRecipeQuery(query("offset=-1")).offset).toBe(0);
    expect(parseRecipeQuery(query("offset=abc")).offset).toBe(0);
    expect(parseRecipeQuery(query("offset=1e9")).offset).toBe(0);
    expect(parseRecipeQuery(query("offset=999999999")).offset).toBe(2_000);
  });

  it("caps maximum cooking time to one day", () => {
    expect(parseRecipeQuery(query("maxMinutes=999999")).maxMinutes).toBe(1_440);
    expect(parseRecipeQuery(query("maxMinutes=12minutes")).maxMinutes).toBeNull();
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
