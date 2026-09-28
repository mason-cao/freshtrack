// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddItemDialog } from "./add-item-dialog";

vi.mock("@/lib/analytics-client", () => ({ trackAnalyticsEvent: vi.fn() }));

describe("AddItemDialog", () => {
  it("renders its default trigger for inline use", () => {
    const html = renderToStaticMarkup(<AddItemDialog onItemAdded={() => undefined} />);

    expect(html).toContain("Add Item");
  });

  it("can hide its trigger when opened by an external control", () => {
    const html = renderToStaticMarkup(
      <AddItemDialog
        onItemAdded={() => undefined}
        open={false}
        onOpenChange={() => undefined}
        showTrigger={false}
      />
    );

    expect(html).not.toContain("Add Item");
  });
});

describe("AddItemDialog saving", () => {
  let root: Root;
  let container: HTMLDivElement;
  const posted: unknown[] = [];

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    posted.length = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "/api/items" && init?.method === "POST") {
        posted.push(JSON.parse(String(init.body)));
        return Response.json({ id: posted.length }, { status: 201 });
      }
      return Response.json([]);
    }));
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function input(selector: string) {
    return document.querySelector<HTMLInputElement>(selector)!;
  }

  async function type(element: HTMLInputElement, value: string) {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    await act(async () => {
      setValue.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  function button(label: string) {
    return [...document.querySelectorAll("button")].find(
      (element) => element.textContent?.trim() === label
    )!;
  }

  async function fillAndClick(name: string, label: string) {
    await type(input('input[id$="-name"]'), name);
    await type(input('input[id$="-expiration"]'), "2026-10-05");
    await act(async () => button(label).click());
  }

  it("keeps the dialog open with a cleared form after Save & add another", async () => {
    const onItemAdded = vi.fn();
    const onOpenChange = vi.fn();
    await act(async () =>
      root.render(<AddItemDialog open onOpenChange={onOpenChange} onItemAdded={onItemAdded} showTrigger={false} />)
    );

    await fillAndClick("Milk", "Save & add another");

    expect(posted).toEqual([expect.objectContaining({ name: "Milk", expirationDate: "2026-10-05" })]);
    expect(onItemAdded).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(input('input[id$="-name"]').value).toBe("");
    expect(document.activeElement).toBe(input('input[id$="-name"]'));
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Added “Milk”");

    await fillAndClick("Eggs", "Save & add another");
    expect(posted).toHaveLength(2);
    expect(onItemAdded).toHaveBeenCalledTimes(2);
  });

  it("closes the dialog after Add to Pantry", async () => {
    const onItemAdded = vi.fn();
    const onOpenChange = vi.fn();
    await act(async () =>
      root.render(<AddItemDialog open onOpenChange={onOpenChange} onItemAdded={onItemAdded} showTrigger={false} />)
    );

    await fillAndClick("Milk", "Add to Pantry");

    expect(posted).toHaveLength(1);
    expect(onItemAdded).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
