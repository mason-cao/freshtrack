import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LandingCta } from "./landing-cta";

describe("LandingCta", () => {
  it("does not advertise offline support before offline mode exists", () => {
    const html = renderToStaticMarkup(<LandingCta isAuthenticated={false} />);

    expect(html).not.toContain("offline");
  });
});
