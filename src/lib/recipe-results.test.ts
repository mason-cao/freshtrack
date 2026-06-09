import { describe, expect, it } from "vitest";
import { facetValues, uniqueRecipeRows } from "./recipe-results";

describe("uniqueRecipeRows", () => {
  it("merges candidate groups by id while preserving first-seen order", () => {
    const rows = uniqueRecipeRows(
      [
        { id: 2, name: "Bravo" },
        { id: 1, name: "Alpha" },
      ],
      [
        { id: 1, name: "Alpha duplicate" },
        { id: 3, name: "Charlie" },
      ]
    );

    expect(rows).toEqual([
      { id: 2, name: "Bravo" },
      { id: 1, name: "Alpha" },
      { id: 3, name: "Charlie" },
    ]);
  });
});

describe("facetValues", () => {
  it("deduplicates, removes empty values, and sorts labels", () => {
    expect(facetValues(["Italian", null, "  ", "Japanese", "Italian"])).toEqual([
      "Italian",
      "Japanese",
    ]);
  });
});
