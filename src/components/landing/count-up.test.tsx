import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CountUp,
  formatCountUpValue,
  getCountUpFrameValue,
} from "./count-up";

describe("CountUp", () => {
  it("renders the final value in server HTML for crawlers and no-JS clients", () => {
    const html = renderToStaticMarkup(<CountUp value={1500} prefix="$" />);

    expect(html).toContain("$1,500");
  });

  it("formats count-up values consistently", () => {
    expect(formatCountUpValue(1500, "comma")).toBe("1,500");
    expect(formatCountUpValue(40, "none")).toBe("40");
  });

  it("calculates eased animation frames from zero to the target value", () => {
    const halfwayValue = getCountUpFrameValue({
      elapsedMs: 800,
      durationMs: 1600,
      value: 1500,
    });

    expect(getCountUpFrameValue({ elapsedMs: 0, durationMs: 1600, value: 1500 })).toBe(0);
    expect(halfwayValue).toBeGreaterThan(0);
    expect(halfwayValue).toBeLessThan(1500);
    expect(getCountUpFrameValue({ elapsedMs: 1600, durationMs: 1600, value: 1500 })).toBe(
      1500
    );
  });

  it("can animate from a non-zero starting value for range stats", () => {
    expect(
      getCountUpFrameValue({
        elapsedMs: 0,
        durationMs: 1600,
        startValue: 30,
        value: 40,
      })
    ).toBe(30);
    expect(
      getCountUpFrameValue({
        elapsedMs: 1600,
        durationMs: 1600,
        startValue: 30,
        value: 40,
      })
    ).toBe(40);
  });
});
