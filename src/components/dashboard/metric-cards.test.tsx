import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MetricCards } from "./metric-cards";

function useRateCell(html: string) {
  const start = html.indexOf("Use rate");
  return html.slice(start, html.indexOf("Expiring soon", start));
}

describe("MetricCards", () => {
  it("shows a placeholder instead of a use rate before anything is logged", () => {
    const html = useRateCell(
      renderToStaticMarkup(
        <MetricCards items={[]} useRate={100} expiringCount={0} hasHistory={false} />
      )
    );

    expect(html).toMatch(/>—</);
    expect(html).not.toMatch(/>100</);
    expect(html).not.toMatch(/>%</);
    expect(html).toContain("Early days");
  });

  it("shows the use rate once there is history", () => {
    const html = useRateCell(
      renderToStaticMarkup(
        <MetricCards items={[]} useRate={75} expiringCount={0} hasHistory />
      )
    );

    expect(html).toMatch(/>75</);
    expect(html).toMatch(/>%</);
    expect(html).toContain("Holding steady");
  });
});
