import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GrowthSnapshot } from "@/db/growth-analytics";
import { buildWeeklyActiveSeries } from "@/lib/growth-analytics";
import { GrowthSections } from "./growth-sections";

const now = new Date("2026-09-28T12:00:00Z");

// The snapshot the growth SQL produced for its hand-computed fixture.
const snapshot: GrowthSnapshot = {
  cohortDays: 30,
  funnel: { signedUp: 4, addedItem: 3, addedFiveItems: 1, loggedOutcome: 1, week1Eligible: 3, returnedWeek1: 1 },
  weeklyActive: buildWeeklyActiveSeries(
    [
      { weekStart: "2026-08-31", activeUsers: 2, returningUsers: 0 },
      { weekStart: "2026-09-07", activeUsers: 1, returningUsers: 1 },
      { weekStart: "2026-09-14", activeUsers: 1, returningUsers: 1 },
      { weekStart: "2026-09-21", activeUsers: 2, returningUsers: 1 },
    ],
    now,
    12
  ),
  retention: [
    { cohortWeek: "2026-08-31", size: 2, weeks: [
      { eligible: 2, retained: 1, percent: 50 }, { eligible: 2, retained: 0, percent: 0 }, null, null, null, null,
    ] },
    { cohortWeek: "2026-09-21", size: 1, weeks: [null, null, null, null, null, null] },
  ],
  signupSources: [
    { label: "google.com", signups: 1 },
    { label: "reddit", signups: 1 },
  ],
  signupLandingPages: [{ label: "/foods/avocado", signups: 1 }],
};

function text(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

describe("GrowthSections", () => {
  const html = renderToStaticMarkup(<GrowthSections growth={snapshot} />);
  const content = text(html);

  it("shows each milestone as a count and share of sign-ups", () => {
    expect(content).toContain("Added an item 3 75%");
    expect(content).toContain("Added 5+ items 1 25%");
    expect(content).toContain("Marked an item used or wasted 1 25%");
  });

  it("measures the week-one return against sign-ups old enough to have had a week", () => {
    expect(content).toContain("1 of 3 33%");
  });

  it("summarizes last full week and keeps every week reachable in a table", () => {
    expect(content).toContain("Active last week 2");
    expect(content).toContain("Returning last week 1");
    expect(html.match(/<tr/g)?.length).toBeGreaterThanOrEqual(13);
    expect(content).toContain("Sep 21 2 1 1");
  });

  it("renders retention cells with counts and leaves unreached weeks blank", () => {
    expect(content).toContain("Aug 31 2 50% 1/2 0% 0/2 — — — —");
    expect(content).toContain("Sep 21 1 — — — — — —");
  });

  it("ranks sign-up sources and landing pages", () => {
    expect(content).toContain("google.com 1");
    expect(content).toContain("/foods/avocado 1");
  });

  it("explains empty states instead of showing zeros", () => {
    const empty = text(
      renderToStaticMarkup(
        <GrowthSections
          growth={{
            ...snapshot,
            funnel: { signedUp: 0, addedItem: 0, addedFiveItems: 0, loggedOutcome: 0, week1Eligible: 0, returnedWeek1: 0 },
            retention: [],
            signupSources: [],
            signupLandingPages: [],
          }}
        />
      )
    );
    expect(empty).toContain("No sign-ups in the last 30 days yet");
    expect(empty).toContain("No sign-ups in the last 8 weeks yet");
  });
});
