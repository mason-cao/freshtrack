import { describe, expect, it } from "vitest";
import { buildStatsSummary } from "./stats-summary";

describe("buildStatsSummary", () => {
  it("builds totals and ordered monthly data from grouped rows", () => {
    expect(
      buildStatsSummary([
        { month: "2026-05", action: "wasted", itemCount: "2", costTotal: "7.5" },
        { month: "2026-04", action: "consumed", itemCount: 3, costTotal: 12 },
        { month: "2026-05", action: "consumed", itemCount: 1, costTotal: null },
      ])
    ).toEqual({
      monthly: [
        {
          month: "2026-04",
          monthLabel: "Apr 2026",
          consumed: 3,
          wasted: 0,
          consumedCost: 12,
          wastedCost: 0,
        },
        {
          month: "2026-05",
          monthLabel: "May 2026",
          consumed: 1,
          wasted: 2,
          consumedCost: 0,
          wastedCost: 7.5,
        },
      ],
      totals: {
        consumed: 4,
        wasted: 2,
        consumedCost: 12,
        wastedCost: 7.5,
        wasteRate: 33,
        moneySaved: 12,
      },
    });
  });

  it("returns an empty summary when there are no logs", () => {
    expect(buildStatsSummary([])).toEqual({
      monthly: [],
      totals: {
        consumed: 0,
        wasted: 0,
        consumedCost: 0,
        wastedCost: 0,
        wasteRate: 0,
        moneySaved: 0,
      },
    });
  });
});
