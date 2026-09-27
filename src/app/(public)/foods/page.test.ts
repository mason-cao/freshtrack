import { describe, expect, it } from "vitest";

import { metadata } from "./page";

describe("foods index metadata", () => {
  it("leaves brand suffixing to the root metadata template", () => {
    expect(metadata.title).toBe("Food shelf life and storage guides");
  });
});
