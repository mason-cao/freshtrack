import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./request-security";

function requestWithHeaders(headers: Record<string, string>) {
  return new Request("https://freshtrack.up.railway.app/api/items", {
    method: "POST",
    headers,
  });
}

describe("isSameOriginRequest", () => {
  it("allows requests with a matching origin", () => {
    expect(
      isSameOriginRequest(
        requestWithHeaders({ origin: "https://freshtrack.up.railway.app" })
      )
    ).toBe(true);
  });

  it("rejects requests with a different origin", () => {
    expect(
      isSameOriginRequest(requestWithHeaders({ origin: "https://evil.test" }))
    ).toBe(false);
  });

  it("falls back to the referer header when origin is absent", () => {
    expect(
      isSameOriginRequest(
        requestWithHeaders({
          referer: "https://freshtrack.up.railway.app/pantry",
        })
      )
    ).toBe(true);

    expect(
      isSameOriginRequest(
        requestWithHeaders({ referer: "https://evil.test/form" })
      )
    ).toBe(false);
  });

  it("allows requests without browser origin headers", () => {
    expect(isSameOriginRequest(requestWithHeaders({}))).toBe(true);
  });
});
