import { describe, expect, it } from "vitest";

import { metadata } from "./page";

describe("landing page metadata", () => {
  it("opts out of the root title template because the title leads with the brand", () => {
    expect(metadata.title).toEqual({
      absolute: "FreshTrack. Stop throwing out groceries. Save money. Waste less food.",
    });
  });
});
