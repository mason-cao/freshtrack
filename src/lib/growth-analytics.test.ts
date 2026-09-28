import { describe, expect, it } from "vitest";
import {
  RETENTION_WEEK_OFFSETS,
  buildRetentionTable,
  buildWeeklyActiveSeries,
  classifySignupSource,
  niceAxisMax,
  percentOf,
  retentionShade,
  startOfUtcWeek,
  summarizeSignupTouches,
} from "./growth-analytics";

const OWN_HOSTS = ["myfreshtrack.app", "freshtrack.up.railway.app"];

describe("startOfUtcWeek", () => {
  it("returns Monday 00:00 UTC, matching Postgres date_trunc('week')", () => {
    expect(startOfUtcWeek(new Date("2026-09-28T15:30:00Z")).toISOString()).toBe(
      "2026-09-28T00:00:00.000Z"
    );
    expect(startOfUtcWeek(new Date("2026-09-27T23:59:59Z")).toISOString()).toBe(
      "2026-09-21T00:00:00.000Z"
    );
  });
});

describe("buildWeeklyActiveSeries", () => {
  it("fills weeks without activity with zeros, oldest first", () => {
    const series = buildWeeklyActiveSeries(
      [{ weekStart: "2026-09-21", activeUsers: 4, returningUsers: 3 }],
      new Date("2026-09-28T12:00:00Z"),
      3
    );

    expect(series).toEqual([
      { weekStart: "2026-09-14", activeUsers: 0, returningUsers: 0 },
      { weekStart: "2026-09-21", activeUsers: 4, returningUsers: 3 },
      { weekStart: "2026-09-28", activeUsers: 0, returningUsers: 0 },
    ]);
  });
});

describe("buildRetentionTable", () => {
  it("shapes cohort cells into rows, marking unreached weeks as null", () => {
    const table = buildRetentionTable(
      [
        { cohortWeek: "2026-09-07", size: 4 },
        { cohortWeek: "2026-08-31", size: 2 },
      ],
      [
        { cohortWeek: "2026-08-31", weekOffset: 1, eligible: 2, retained: 1 },
        { cohortWeek: "2026-08-31", weekOffset: 2, eligible: 2, retained: 0 },
        { cohortWeek: "2026-09-07", weekOffset: 1, eligible: 3, retained: 3 },
      ],
      [1, 2, 3]
    );

    expect(table).toEqual([
      {
        cohortWeek: "2026-08-31",
        size: 2,
        weeks: [
          { eligible: 2, retained: 1, percent: 50 },
          { eligible: 2, retained: 0, percent: 0 },
          null,
        ],
      },
      {
        cohortWeek: "2026-09-07",
        size: 4,
        weeks: [{ eligible: 3, retained: 3, percent: 100 }, null, null],
      },
    ]);
  });

  it("tracks six weeks after sign-up by default", () => {
    expect(RETENTION_WEEK_OFFSETS).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("retentionShade", () => {
  it("maps retention percentages onto ordered shade steps", () => {
    expect(retentionShade(0)).toBe(0);
    expect(retentionShade(10)).toBe(1);
    expect(retentionShade(20)).toBe(2);
    expect(retentionShade(40)).toBe(3);
    expect(retentionShade(50)).toBe(4);
    expect(retentionShade(70)).toBe(5);
    expect(retentionShade(100)).toBe(6);
  });
});

describe("classifySignupSource", () => {
  it("prefers the campaign source when one was tagged", () => {
    expect(
      classifySignupSource({ path: "/", referrer: "https://www.reddit.com/r/Frugal/", utmSource: " Reddit " }, OWN_HOSTS)
    ).toBe("reddit");
  });

  it("falls back to the referring site without www", () => {
    expect(
      classifySignupSource({ path: "/foods/avocado", referrer: "https://www.google.com/", utmSource: null }, OWN_HOSTS)
    ).toBe("google.com");
  });

  it("treats our own domains and the Google sign-in bounce as direct", () => {
    for (const referrer of [
      "https://myfreshtrack.app/foods",
      "https://freshtrack.up.railway.app/",
      "https://accounts.google.com/",
      null,
    ]) {
      expect(classifySignupSource({ path: "/", referrer, utmSource: null }, OWN_HOSTS)).toBe(
        "Direct or unknown"
      );
    }
  });

  it("labels sign-ups with no recorded visits", () => {
    expect(classifySignupSource(null, OWN_HOSTS)).toBe("No visit data");
  });
});

describe("summarizeSignupTouches", () => {
  it("ranks sources and landing pages by sign-ups, folding the tail into Other", () => {
    const touches = [
      { path: "/foods/avocado", referrer: "https://www.google.com/", utmSource: null },
      { path: "/foods/avocado", referrer: "https://www.google.com/", utmSource: null },
      { path: "/", referrer: null, utmSource: "reddit" },
      { path: "/", referrer: "https://t.co/", utmSource: null },
      null,
    ];

    expect(summarizeSignupTouches(touches, OWN_HOSTS, 3)).toEqual({
      sources: [
        { label: "google.com", signups: 2 },
        { label: "No visit data", signups: 1 },
        { label: "reddit", signups: 1 },
        { label: "Other", signups: 1 },
      ],
      landingPages: [
        { label: "/", signups: 2 },
        { label: "/foods/avocado", signups: 2 },
      ],
    });
  });
});

describe("percentOf", () => {
  it("rounds to whole percents and has no rate without a denominator", () => {
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(0, 0)).toBeNull();
  });
});

describe("niceAxisMax", () => {
  it("rounds the axis ceiling up to a clean number", () => {
    expect(niceAxisMax(0)).toBe(1);
    expect(niceAxisMax(3)).toBe(4);
    expect(niceAxisMax(7)).toBe(8);
    expect(niceAxisMax(13)).toBe(20);
    expect(niceAxisMax(46)).toBe(50);
    expect(niceAxisMax(120)).toBe(200);
  });
});
