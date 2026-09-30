import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db/reminders", () => ({ sendDueReminders: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn(), captureMessage: vi.fn() }));
import * as Sentry from "@sentry/nextjs";
import {
  REMINDER_FIRST_RUN_DELAY_MS,
  REMINDER_RUN_INTERVAL_MS,
  startReminderScheduler,
} from "./reminder-scheduler";

const summary = { checked: 1, due: 1, sent: 1, noItems: 0, failed: 0, stoppedEarly: false };

describe("startReminderScheduler", () => {
  let stop: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("waits briefly after startup, then runs on a fixed interval", async () => {
    const run = vi.fn(async () => summary);
    stop = startReminderScheduler(run);

    await vi.advanceTimersByTimeAsync(REMINDER_FIRST_RUN_DELAY_MS - 1);
    expect(run).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(run).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(REMINDER_RUN_INTERVAL_MS);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("starts only once per process", async () => {
    const run = vi.fn(async () => summary);
    stop = startReminderScheduler(run);
    const second = startReminderScheduler(run);

    await vi.advanceTimersByTimeAsync(REMINDER_FIRST_RUN_DELAY_MS);
    expect(run).toHaveBeenCalledTimes(1);
    second();
  });

  it("skips a tick while the previous run is still going", async () => {
    let finish!: () => void;
    const run = vi.fn(
      () => new Promise<typeof summary>((resolve) => { finish = () => resolve(summary); })
    );
    stop = startReminderScheduler(run);

    await vi.advanceTimersByTimeAsync(REMINDER_FIRST_RUN_DELAY_MS + REMINDER_RUN_INTERVAL_MS);
    expect(run).toHaveBeenCalledTimes(1);
    finish();
    await vi.advanceTimersByTimeAsync(REMINDER_RUN_INTERVAL_MS);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("keeps running after a failed run", async () => {
    const run = vi.fn().mockRejectedValueOnce(new Error("db down")).mockResolvedValue(summary);
    stop = startReminderScheduler(run);

    await vi.advanceTimersByTimeAsync(REMINDER_FIRST_RUN_DELAY_MS + REMINDER_RUN_INTERVAL_MS);
    expect(run).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith("[reminders] run failed", expect.any(Error));
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.objectContaining({ message: "db down" }));
  });

  it("reports failed sends so a broken email setup does not go unnoticed", async () => {
    const run = vi.fn(async () => ({ ...summary, sent: 0, failed: 2 }));
    stop = startReminderScheduler(run);

    await vi.advanceTimersByTimeAsync(REMINDER_FIRST_RUN_DELAY_MS);
    expect(Sentry.captureMessage).toHaveBeenCalledWith("[reminders] 2 reminder emails failed to send", "error");
  });
});
