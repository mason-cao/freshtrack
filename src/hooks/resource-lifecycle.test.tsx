// @vitest-environment jsdom
import { StrictMode, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddItemDialog } from "@/components/pantry/add-item-dialog";
import { useResource } from "./use-resource";
import { useRecipeCatalog } from "./use-recipe-catalog";
import { useProductLookup } from "./use-product-lookup";
import { PantryUndoToast } from "@/components/pantry/pantry-undo-toast";
import { notifyPantryActionCompleted } from "@/lib/pantry-events";

vi.mock("@/lib/analytics-client", () => ({ trackAnalyticsEvent: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("request lifecycles", () => {
  it("supports an uncontrolled dialog with an open-change callback", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json([])));
    const onOpenChange = vi.fn();
    await act(async () => root.render(<AddItemDialog onOpenChange={onOpenChange} onItemAdded={() => {}} />));
    await act(async () => container.querySelector("button")!.click());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it("loads add-dialog categories under StrictMode without canceling itself", async () => {
    const response = deferred<Response>();
    vi.stubGlobal("fetch", vi.fn(() => response.promise.then((value) => value.clone())));
    await act(async () => root.render(<StrictMode><AddItemDialog open onItemAdded={() => {}} /></StrictMode>));
    expect(document.querySelector<HTMLButtonElement>('[role="combobox"]')?.disabled).toBe(true);
    await act(async () => response.resolve(Response.json([
      { id: 2, name: "Dairy", icon: "milk", defaultShelfLifeDays: 7 },
    ])));
    expect(document.querySelector<HTMLButtonElement>('[role="combobox"]')?.disabled).toBe(false);
  });

  it("retries errors and ignores older responses even if the transport ignores abort", async () => {
    const older = deferred<string>();
    const newer = deferred<string>();
    const load = vi.fn().mockRejectedValueOnce(new Error("Unavailable")).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    function Probe() {
      const { data, loading, error, refresh } = useResource<string>(load);
      return <button onClick={refresh}>{error ?? data ?? (loading ? "Loading" : "Empty")}</button>;
    }
    await act(async () => root.render(<Probe />));
    expect(container.textContent).toBe("Unavailable");
    await act(async () => container.querySelector("button")!.click());
    await act(async () => container.querySelector("button")!.click());
    expect(load.mock.calls[1][0].aborted).toBe(true);
    await act(async () => newer.resolve("Current pantry"));
    await act(async () => older.resolve("Old pantry"));
    expect(container.textContent).toBe("Current pantry");
  });

  it("restarts category loading after closing and reopening mid-request", async () => {
    const requests: ReturnType<typeof deferred<Response>>[] = [];
    vi.stubGlobal("fetch", vi.fn(() => {
      const response = deferred<Response>(); requests.push(response); return response.promise;
    }));
    const render = (open: boolean) => root.render(<AddItemDialog open={open} onItemAdded={() => {}} />);
    await act(async () => render(true));
    await act(async () => render(false));
    await act(async () => render(true));
    await act(async () => requests.at(-1)!.resolve(Response.json([])));
    await act(async () => requests[0].resolve(Response.json([{ id: 1, name: "Stale", icon: "", defaultShelfLifeDays: 1 }])));
    expect(document.querySelector<HTMLButtonElement>('[role="combobox"]')?.disabled).toBe(false);
  });

  it("never applies a product lookup after the dialog closes", async () => {
    const response = deferred<Response>();
    vi.stubGlobal("fetch", vi.fn(() => response.promise.then((value) => value.clone())));
    const apply = vi.fn();
    function Lookup({ open }: { open: boolean }) {
      const { lookup, pending } = useProductLookup(open);
      return <button onClick={() => void lookup("012345678901", apply)}>{pending ? "Pending" : "Scan"}</button>;
    }
    await act(async () => root.render(<Lookup open />));
    await act(async () => container.querySelector("button")!.click());
    await act(async () => root.render(<Lookup open={false} />));
    await act(async () => root.render(<Lookup open />));
    await act(async () => response.resolve(Response.json({ found: true, name: "Stale product" })));
    expect(apply).not.toHaveBeenCalled();
    expect(container.textContent).toBe("Scan");
  });
});

it("does not dismiss a newer undo notification when an older restore finishes", async () => {
  const response = deferred<Response>();
  vi.stubGlobal("fetch", vi.fn(() => response.promise));
  const restored = vi.fn();
  await act(async () => root.render(<PantryUndoToast onRestored={restored} />));
  await act(async () => notifyPantryActionCompleted({ itemId: 1, itemName: "Milk", action: "consume" }));
  await act(async () => container.querySelector("button")!.click());
  await act(async () => notifyPantryActionCompleted({ itemId: 2, itemName: "Bread", action: "waste" }));
  await act(async () => response.resolve(Response.json({ success: true })));
  expect(container.textContent).toContain("Marked Bread wasted");
  expect(restored).toHaveBeenCalledOnce();
});

it("advances recipe pagination by the server offset even when pages overlap", async () => {
  const offsets: number[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url === "/api/recipes/facets") return Response.json({ cuisines: [], categories: [] });
    if (url === "/api/recipes/suggestions") return Response.json([]);
    const offset = Number(new URL(url, "https://freshtrack.test").searchParams.get("offset"));
    offsets.push(offset);
    return Response.json({
      recipes: (offset === 0 ? [1, 2] : offset === 2 ? [2, 3] : []).map((id) => ({ id, name: String(id) })),
      offset, limit: 2, total: 5,
    });
  }));
  function Catalog() {
    const { diveRecipes, showMore, canShowMore } = useRecipeCatalog();
    return <button onClick={showMore} disabled={!canShowMore}>{diveRecipes.map((recipe) => recipe.id).join(",")}</button>;
  }
  await act(async () => root.render(<Catalog />));
  await act(async () => container.querySelector("button")!.click());
  expect(container.textContent).toBe("1,2,3");
  await act(async () => container.querySelector("button")!.click());
  expect(offsets).toEqual([0, 2, 4]);
  expect(container.querySelector("button")!.disabled).toBe(true);
});
