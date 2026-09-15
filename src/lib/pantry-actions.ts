"use client";

import { fetchJson } from "./api-client";
import { trackAnalyticsEvent } from "./analytics-client";
import { notifyPantryActionCompleted, type PantryActionOutcome } from "./pantry-events";

export async function completePantryItem(outcome: PantryActionOutcome) {
  await fetchJson(`/api/items/${outcome.itemId}/${outcome.action}`, { method: "POST" });
  trackAnalyticsEvent(outcome.action === "consume" ? "item_consumed" : "item_wasted");
  notifyPantryActionCompleted(outcome);
  return outcome;
}
