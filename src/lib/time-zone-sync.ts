"use client";

// Reminder emails go out in the user's local morning, so the server needs the
// browser's time zone. Sent once per browser session; failures retry later.
const SYNCED_KEY = "freshtrack:time-zone-synced";

export async function syncBrowserTimeZone(): Promise<void> {
  let timeZone: string | undefined;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone || window.sessionStorage.getItem(SYNCED_KEY) === timeZone) return;
  } catch {
    return;
  }

  try {
    const response = await fetch("/api/account/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeZone }),
    });
    if (response.ok) window.sessionStorage.setItem(SYNCED_KEY, timeZone);
  } catch {
    // Offline or blocked; the next session tries again.
  }
}
