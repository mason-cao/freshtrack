import { describe, expect, it } from "vitest";

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
