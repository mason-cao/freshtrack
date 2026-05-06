import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";
import { resolveCurrentUserId } from "./session";

function sessionWithUserId(id: string): Session {
  return {
    user: {
      id,
      name: "Test User",
      email: "test@example.com",
      image: null,
    },
    expires: "2099-01-01T00:00:00.000Z",
  };
}

describe("resolveCurrentUserId", () => {
  it("returns the authenticated session user id", () => {
    expect(resolveCurrentUserId(sessionWithUserId("user_123"))).toBe("user_123");
  });

  it("throws when there is no session", () => {
    expect(() => resolveCurrentUserId(null)).toThrow("Authentication required.");
  });

  it("throws when the session has no user id", () => {
    const sessionWithoutId = {
      user: {
        name: "Missing Id",
        email: "missing@example.com",
        image: null,
      },
      expires: "2099-01-01T00:00:00.000Z",
    } as unknown as Session;

    expect(() => resolveCurrentUserId(sessionWithoutId)).toThrow(
      "Authentication required."
    );
  });
});
