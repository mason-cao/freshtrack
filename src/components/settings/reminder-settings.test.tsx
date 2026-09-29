// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReminderSettings } from "./reminder-settings";

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

function toggle() {
  return container.querySelector<HTMLButtonElement>('[role="switch"]')!;
}

describe("ReminderSettings", () => {
  it("explains what will be sent, to whom, and when", async () => {
    await act(async () =>
      root.render(<ReminderSettings email="cook@example.com" initialEnabled timeZone="Europe/London" />)
    );
    expect(toggle().getAttribute("aria-checked")).toBe("true");
    expect(container.textContent).toContain("cook@example.com");
    expect(container.textContent).toContain("Europe/London");
  });

  it("saves the new setting when toggled", async () => {
    const fetchMock = vi.fn(async () => Response.json({ reminderEmailsEnabled: false }));
    vi.stubGlobal("fetch", fetchMock);
    await act(async () =>
      root.render(<ReminderSettings email="cook@example.com" initialEnabled timeZone={null} />)
    );

    await act(async () => toggle().click());

    expect(toggle().getAttribute("aria-checked")).toBe("false");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/account/settings",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ reminderEmailsEnabled: false }) })
    );
    expect(container.textContent).toContain("Reminder emails are off.");
  });

  it("reverts and explains when saving fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "Too many account changes." }, { status: 429 })));
    await act(async () =>
      root.render(<ReminderSettings email="cook@example.com" initialEnabled={false} timeZone={null} />)
    );

    await act(async () => toggle().click());

    expect(toggle().getAttribute("aria-checked")).toBe("false");
    expect(container.querySelector('[role="alert"]')?.textContent).toBe("Too many account changes.");
  });
});
