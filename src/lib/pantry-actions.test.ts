import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), track: vi.fn(), notify: vi.fn() }));
vi.mock("./api-client", () => ({ fetchJson: mocks.fetch }));
vi.mock("./analytics-client", () => ({ trackAnalyticsEvent: mocks.track }));
vi.mock("./pantry-events", () => ({ notifyPantryActionCompleted: mocks.notify }));
import { completePantryItem } from "./pantry-actions";

it("does not publish success or undo events when completion fails", async () => {
  vi.clearAllMocks();
  mocks.fetch.mockRejectedValueOnce(new Error("Not found"));
  await expect(completePantryItem({ itemId: 1, itemName: "Milk", action: "consume" })).rejects.toThrow("Not found");
  expect(mocks.track).not.toHaveBeenCalled();
  expect(mocks.notify).not.toHaveBeenCalled();
});

describe.each(["consume", "waste"] as const)("pantry %s action", (action) => {
  it("publishes a single matching outcome after the mutation succeeds", async () => {
    vi.clearAllMocks();
    mocks.fetch.mockResolvedValueOnce({ success: true });
    const outcome = { itemId: 1, itemName: "Milk", action };
    expect(await completePantryItem(outcome)).toBe(outcome);
    expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith(`/api/items/1/${action}`, { method: "POST" });
    expect(mocks.track).toHaveBeenCalledExactlyOnceWith(action === "consume" ? "item_consumed" : "item_wasted");
    expect(mocks.notify).toHaveBeenCalledExactlyOnceWith(outcome);
  });
});
