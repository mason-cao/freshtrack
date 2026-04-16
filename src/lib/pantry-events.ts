"use client";

const PANTRY_UPDATED_EVENT = "freshtrack:pantry-updated";

export function notifyPantryUpdated() {
  window.dispatchEvent(new Event(PANTRY_UPDATED_EVENT));
}

export function subscribeToPantryUpdates(callback: () => void) {
  window.addEventListener(PANTRY_UPDATED_EVENT, callback);
  return () => window.removeEventListener(PANTRY_UPDATED_EVENT, callback);
}
