import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { buildFoodMetadataTitle } from "./page";

describe("buildFoodMetadataTitle", () => {
  it("leaves brand suffixing to the root metadata template", () => {
    expect(
      buildFoodMetadataTitle({
        h1: "How long does avocado last?",
      })
    ).toBe("How long does avocado last?");
  });
});
