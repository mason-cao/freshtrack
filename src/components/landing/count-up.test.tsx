import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CountUp } from "./count-up";

describe("CountUp", () => {
  it("renders the final value in server HTML for crawlers and no-JS clients", () => {
    const html = renderToStaticMarkup(<CountUp value={1500} prefix="$" />);

    expect(html).toContain("$1,500");
  });
});
