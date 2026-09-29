import { describe, expect, it } from "vitest";
import { validateAccountSettingsPatch } from "./account-settings";

describe("validateAccountSettingsPatch", () => {
  it("accepts the reminder toggle and a real time zone", () => {
    expect(validateAccountSettingsPatch({ reminderEmailsEnabled: false })).toEqual({
      ok: true,
      data: { reminderEmailsEnabled: false },
    });
    expect(validateAccountSettingsPatch({ timeZone: "Europe/London", reminderEmailsEnabled: true })).toEqual({
      ok: true,
      data: { timeZone: "Europe/London", reminderEmailsEnabled: true },
    });
  });

  it("rejects wrong types, unknown zones, and unknown fields", () => {
    expect(validateAccountSettingsPatch({ reminderEmailsEnabled: "no" })).toEqual({
      ok: false,
      error: "reminderEmailsEnabled must be true or false.",
    });
    expect(validateAccountSettingsPatch({ timeZone: "Moon/Base" })).toEqual({
      ok: false,
      error: "timeZone must be an IANA time zone such as America/New_York.",
    });
    expect(validateAccountSettingsPatch({ email: "x@example.com" })).toEqual({
      ok: false,
      error: "Unsupported setting: email.",
    });
  });

  it("requires a JSON object with at least one setting", () => {
    expect(validateAccountSettingsPatch([])).toEqual({ ok: false, error: "Expected a JSON object." });
    expect(validateAccountSettingsPatch({})).toEqual({ ok: false, error: "No settings were provided." });
  });
});
