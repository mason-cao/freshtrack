import { describe, expect, it } from "vitest";
import { greetingName } from "./greeting";

describe("greetingName", () => {
  it("uses the first name from the account name", () => {
    expect(greetingName("Mason Cao")).toBe("Mason");
    expect(greetingName("  Ana  María López ")).toBe("Ana");
    expect(greetingName("Cher")).toBe("Cher");
  });

  it("falls back to Chef when the account has no name", () => {
    expect(greetingName(null)).toBe("Chef");
    expect(greetingName(undefined)).toBe("Chef");
    expect(greetingName("   ")).toBe("Chef");
  });
});
