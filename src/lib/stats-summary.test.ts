import { describe, expect, it } from "vitest";
import { buildStatsSummary, getUseRate } from "./stats-summary";

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

describe("getUseRate", () => {
  it("has no rate before anything is logged", () => {
    expect(getUseRate(0, 0)).toBeNull();
  });

  it("reports the share of logged items that were used", () => {
    expect(getUseRate(3, 1)).toBe(75);
    expect(getUseRate(0, 2)).toBe(0);
    expect(getUseRate(4, 0)).toBe(100);
  });

  it("complements the rounded waste rate so the two always sum to 100", () => {
    // 7 of 8 wasted is 87.5%, which rounds to 88; use rate must be 12, not 13.
    expect(getUseRate(1, 7)).toBe(12);
  });
});
