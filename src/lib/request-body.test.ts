import { describe, expect, it } from "vitest";
import { isRequestBodyOverLimit, readLimitedJsonBody } from "./request-body";

describe("bounded JSON request bodies", () => {
  it("uses content-length as an early rejection hint", () => {
    expect(
      isRequestBodyOverLimit(
        new Request("https://freshtrack.test/api/example", {
          headers: { "content-length": "101" },
        }),
        100
      )
    ).toBe(true);
    expect(
      isRequestBodyOverLimit(
        new Request("https://freshtrack.test/api/example", {
          headers: { "content-length": "invalid" },
        }),
        100
      )
    ).toBe(false);
  });

  it("rejects streamed bodies that exceed the limit", async () => {
    const request = new Request("https://freshtrack.test/api/example", {
      method: "POST",
      body: JSON.stringify({ value: "x".repeat(200) }),
    });

    await expect(readLimitedJsonBody(request, 100)).resolves.toEqual({
      ok: false,
      status: 413,
      error: "Request body is too large.",
    });
  });

  it("parses valid JSON and rejects malformed JSON", async () => {
    await expect(
      readLimitedJsonBody(
        new Request("https://freshtrack.test/api/example", {
          method: "POST",
          body: JSON.stringify({ value: "safe" }),
        }),
        100
      )
    ).resolves.toEqual({ ok: true, body: { value: "safe" } });

    await expect(
      readLimitedJsonBody(
        new Request("https://freshtrack.test/api/example", {
          method: "POST",
          body: "{broken",
        }),
        100
      )
    ).resolves.toEqual({
      ok: false,
      status: 400,
      error: "Invalid JSON body.",
    });
  });

  it("can require an application/json content type", async () => {
    await expect(
      readLimitedJsonBody(
        new Request("https://freshtrack.test/api/example", {
          method: "POST",
          body: "{}",
        }),
        100,
        { requireJsonContentType: true }
      )
    ).resolves.toEqual({
      ok: false,
      status: 415,
      error: "Content-Type must be application/json.",
    });
  });
});
