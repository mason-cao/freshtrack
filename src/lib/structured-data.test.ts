import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./structured-data";

describe("serializeJsonLd", () => {
  it("prevents values from closing the JSON-LD script element", () => {
    const result = serializeJsonLd({ value: "</script><script>alert(1)</script>" });

    expect(result).not.toContain("<");
    expect(result).toContain("\\u003c/script>");
  });
});
