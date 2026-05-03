"use client";

const PANTRY_UPDATED_EVENT = "freshtrack:pantry-updated";
const PANTRY_ACTION_EVENT = "freshtrack:pantry-action";

export type PantryCompletionAction = "consume" | "waste";

export interface PantryActionOutcome {
  itemId: number;
  itemName: string;
  action: PantryCompletionAction;
}

export function notifyPantryUpdated() {
  window.dispatchEvent(new Event(PANTRY_UPDATED_EVENT));
}

export function subscribeToPantryUpdates(callback: () => void) {
  window.addEventListener(PANTRY_UPDATED_EVENT, callback);
  return () => window.removeEventListener(PANTRY_UPDATED_EVENT, callback);
}

export function notifyPantryActionCompleted(outcome: PantryActionOutcome) {
  window.dispatchEvent(new CustomEvent(PANTRY_ACTION_EVENT, { detail: outcome }));
}

export function subscribeToPantryActions(callback: (outcome: PantryActionOutcome) => void) {
  function handleEvent(event: Event) {
    callback((event as CustomEvent<PantryActionOutcome>).detail);
  }

  window.addEventListener(PANTRY_ACTION_EVENT, handleEvent);
  return () => window.removeEventListener(PANTRY_ACTION_EVENT, handleEvent);
}
