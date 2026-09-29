import { describe, expect, it } from "vitest";
import {
  DEFAULT_REMINDER_TIME_ZONE,
  addDaysToDate,
  daysBetween,
  isReminderDue,
  isValidTimeZone,
  localDateAndHour,
  resolveReminderTimeZone,
  shouldRunReminderScheduler,
} from "./reminder-schedule";

// 12:30 UTC on a Monday: 08:30 in New York (EDT), 05:30 in Los Angeles, 21:30 in Tokyo.
const now = new Date("2026-09-28T12:30:00Z");

describe("time zones", () => {
  it("accepts IANA zones and rejects anything else", () => {
    expect(isValidTimeZone("America/New_York")).toBe(true);
    expect(isValidTimeZone("Asia/Tokyo")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(42)).toBe(false);
    expect(isValidTimeZone("A".repeat(65))).toBe(false);
  });

  it("falls back to New York time until the browser reports a zone", () => {
    expect(resolveReminderTimeZone(null)).toBe(DEFAULT_REMINDER_TIME_ZONE);
    expect(resolveReminderTimeZone("Not/AZone")).toBe(DEFAULT_REMINDER_TIME_ZONE);
    expect(resolveReminderTimeZone("Europe/London")).toBe("Europe/London");
  });

  it("reads the local calendar date and hour", () => {
    expect(localDateAndHour(now, "America/New_York")).toEqual({ date: "2026-09-28", hour: 8 });
    expect(localDateAndHour(now, "Asia/Tokyo")).toEqual({ date: "2026-09-28", hour: 21 });
    expect(localDateAndHour(new Date("2026-09-28T02:00:00Z"), "America/New_York")).toEqual({
      date: "2026-09-27",
      hour: 22,
    });
    expect(localDateAndHour(new Date("2026-09-28T04:00:00Z"), "America/New_York")).toEqual({
      date: "2026-09-28",
      hour: 0,
    });
  });
});

describe("date arithmetic", () => {
  it("adds days across month ends and counts days between dates", () => {
    expect(addDaysToDate("2026-09-29", 2)).toBe("2026-10-01");
    expect(daysBetween("2026-09-28", "2026-09-30")).toBe(2);
    expect(daysBetween("2026-09-28", "2026-09-28")).toBe(0);
  });
});

describe("isReminderDue", () => {
  it("sends once the user's morning starts", () => {
    expect(isReminderDue({ now, timeZone: "America/New_York", lastReminderOn: null })).toEqual({
      due: true,
      today: "2026-09-28",
    });
  });

  it("waits for the morning and skips late evenings", () => {
    expect(isReminderDue({ now, timeZone: "America/Los_Angeles", lastReminderOn: null }).due).toBe(false);
    expect(isReminderDue({ now, timeZone: "Asia/Tokyo", lastReminderOn: null }).due).toBe(false);
    expect(
      isReminderDue({ now: new Date("2026-09-28T11:59:00Z"), timeZone: "Asia/Tokyo", lastReminderOn: null }).due
    ).toBe(true);
  });

  it("sends at most once per local day", () => {
    expect(isReminderDue({ now, timeZone: "America/New_York", lastReminderOn: "2026-09-28" }).due).toBe(false);
    expect(isReminderDue({ now, timeZone: "America/New_York", lastReminderOn: "2026-09-27" }).due).toBe(true);
  });
});

describe("shouldRunReminderScheduler", () => {
  it("runs only in the production server, never during builds", () => {
    expect(shouldRunReminderScheduler({ NODE_ENV: "production" })).toBe(true);
    expect(
      shouldRunReminderScheduler({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" })
    ).toBe(false);
    expect(shouldRunReminderScheduler({ NODE_ENV: "development" })).toBe(false);
  });

  it("can be switched off in production or on for local testing", () => {
    expect(shouldRunReminderScheduler({ NODE_ENV: "production", REMINDER_SCHEDULER: "off" })).toBe(false);
    expect(shouldRunReminderScheduler({ NODE_ENV: "development", REMINDER_SCHEDULER: "on" })).toBe(true);
  });
});
