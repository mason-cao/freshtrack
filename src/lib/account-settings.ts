import { isValidTimeZone } from "./reminder-schedule";

export interface AccountSettingsPatch {
  reminderEmailsEnabled?: boolean;
  timeZone?: string;
}

type ValidationResult =
  | { ok: true; data: AccountSettingsPatch }
  | { ok: false; error: string };

const ALLOWED_FIELDS = new Set(["reminderEmailsEnabled", "timeZone"]);

export function validateAccountSettingsPatch(payload: unknown): ValidationResult {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, error: "Expected a JSON object." };
  }

  const fields = payload as Record<string, unknown>;
  const unknownField = Object.keys(fields).find((key) => !ALLOWED_FIELDS.has(key));
  if (unknownField) return { ok: false, error: `Unsupported setting: ${unknownField}.` };

  const data: AccountSettingsPatch = {};
  if ("reminderEmailsEnabled" in fields) {
    if (typeof fields.reminderEmailsEnabled !== "boolean") {
      return { ok: false, error: "reminderEmailsEnabled must be true or false." };
    }
    data.reminderEmailsEnabled = fields.reminderEmailsEnabled;
  }
  if ("timeZone" in fields) {
    if (!isValidTimeZone(fields.timeZone)) {
      return { ok: false, error: "timeZone must be an IANA time zone such as America/New_York." };
    }
    data.timeZone = fields.timeZone;
  }

  if (Object.keys(data).length === 0) return { ok: false, error: "No settings were provided." };
  return { ok: true, data };
}
