import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RecipeDiveBar } from "./recipe-dive-bar";

const noop = vi.fn();

function renderDiveBar(resultCount: number, resultTotal = resultCount) {
  return renderToStaticMarkup(
    <RecipeDiveBar
      search=""
      onSearchChange={noop}
      cuisine={null}
      onCuisineChange={noop}
      cuisineOptions={[]}
      category={null}
      onCategoryChange={noop}
      categoryOptions={[]}
      maxMinutes={null}
      onMaxMinutesChange={noop}
      sort="relevance"
      onSortChange={noop}
      resultCount={resultCount}
      resultTotal={resultTotal}
    />
  );
}

describe("RecipeDiveBar", () => {
  it("shows the loaded count over the total when a query has more recipes", () => {
    expect(renderDiveBar(80, 612)).toContain("80/612 recipes");
  });

  it("keeps the compact count when all matching recipes are loaded", () => {
    expect(renderDiveBar(42)).toContain("42 recipes");
  });
});
