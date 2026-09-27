// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock("@/lib/pantry-actions", () => ({ completePantryItem: mocks.complete }));
import { ItemActions } from "./item-actions";

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.complete.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function button(label: string) {
  return [...container.querySelectorAll("button")].find(
    (element) => element.textContent?.trim() === label
  );
}

describe("ItemActions", () => {
  it.each([
    ["Used", "consume"],
    ["Wasted", "waste"],
  ] as const)("marks the item %s in a single tap", async (label, action) => {
    const outcome = { itemId: 4, itemName: "Milk", action };
    mocks.complete.mockResolvedValueOnce(outcome);
    const onAction = vi.fn();

    await act(async () => root.render(<ItemActions itemId={4} itemName="Milk" onAction={onAction} />));
    await act(async () => button(label)!.click());

    expect(mocks.complete).toHaveBeenCalledExactlyOnceWith(outcome);
    expect(onAction).toHaveBeenCalledExactlyOnceWith(outcome);
  });

  it("shows the error and stays usable when the update fails", async () => {
    mocks.complete.mockRejectedValueOnce(new Error("Item is already marked as consumed."));
    const onAction = vi.fn();

    await act(async () => root.render(<ItemActions itemId={4} itemName="Milk" onAction={onAction} />));
    await act(async () => button("Used")!.click());

    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      "Item is already marked as consumed."
    );
    expect(onAction).not.toHaveBeenCalled();
    expect(button("Used")?.disabled).toBe(false);
  });
});
