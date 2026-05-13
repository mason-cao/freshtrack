import { describe, expect, it } from "vitest";
import {
  checkItemMutationRateLimit,
  isRequestBodyTooLarge,
  validateCreateItemPayload,
  validatePatchItemPayload,
} from "./_lib";

describe("item API security limits", () => {
  it("rejects create payloads with oversized text fields", () => {
    const basePayload = {
      name: "Greek yogurt",
      expirationDate: "2026-05-20",
      quantity: 1,
      unit: "container",
    };

    expect(
      validateCreateItemPayload({
        ...basePayload,
        name: "x".repeat(81),
      })
    ).toEqual({ ok: false, error: "Item name must be 80 characters or fewer." });

    expect(
      validateCreateItemPayload({
        ...basePayload,
        unit: "x".repeat(25),
      })
    ).toEqual({ ok: false, error: "Unit must be 24 characters or fewer." });

    expect(
      validateCreateItemPayload({
        ...basePayload,
        notes: "x".repeat(501),
      })
    ).toEqual({ ok: false, error: "Notes must be 500 characters or fewer." });
  });

  it("rejects patch payloads with oversized text fields", () => {
    expect(validatePatchItemPayload({ name: "x".repeat(81) })).toEqual({
      ok: false,
      error: "Item name must be 80 characters or fewer.",
    });

    expect(validatePatchItemPayload({ unit: "x".repeat(25) })).toEqual({
      ok: false,
      error: "Unit must be 24 characters or fewer.",
    });

    expect(validatePatchItemPayload({ notes: "x".repeat(501) })).toEqual({
      ok: false,
      error: "Notes must be 500 characters or fewer.",
    });
  });

  it("detects oversized JSON requests from the content-length header", () => {
    expect(
      isRequestBodyTooLarge(
        new Request("https://freshtrack.test/api/items", {
          headers: { "content-length": "8193" },
        })
      )
    ).toBe(true);

    expect(
      isRequestBodyTooLarge(
        new Request("https://freshtrack.test/api/items", {
          headers: { "content-length": "8192" },
        })
      )
    ).toBe(false);

    expect(
      isRequestBodyTooLarge(
        new Request("https://freshtrack.test/api/items", {
          headers: { "content-length": "not-a-number" },
        })
      )
    ).toBe(false);
  });

  it("limits item mutations per user within a fixed window", () => {
    const userId = "rate-limited-user";
    const now = Date.UTC(2026, 4, 13, 12, 0, 0);

    for (let i = 0; i < 60; i++) {
      expect(checkItemMutationRateLimit(userId, now + i).ok).toBe(true);
    }

    expect(checkItemMutationRateLimit(userId, now + 60)).toEqual({
      ok: false,
      retryAfterSeconds: 60,
    });

    expect(checkItemMutationRateLimit(userId, now + 60_001).ok).toBe(true);
  });
});
