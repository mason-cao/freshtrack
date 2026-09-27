// Offer "Install FreshTrack" only after someone has used the pantry a few
// times (items added, used, or wasted) instead of on their first page view.

const PANTRY_ACTIONS_KEY = "freshtrack:install-prompt:pantry-actions";
export const INSTALL_PROMPT_MIN_PANTRY_ACTIONS = 3;

type CounterStorage = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): CounterStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readCount(storage: CounterStorage): number {
  const count = Number(storage.getItem(PANTRY_ACTIONS_KEY));
  return Number.isSafeInteger(count) && count > 0 ? count : 0;
}

export function recordPantryAction(storage = browserStorage()) {
  if (!storage) return;
  try {
    // Capped: past the threshold the exact count no longer matters.
    const next = Math.min(readCount(storage) + 1, INSTALL_PROMPT_MIN_PANTRY_ACTIONS);
    storage.setItem(PANTRY_ACTIONS_KEY, String(next));
  } catch {
    // Browser storage can be unavailable in privacy modes.
  }
}

export function hasEnoughPantryActions(storage = browserStorage()): boolean {
  if (!storage) return false;
  try {
    return readCount(storage) >= INSTALL_PROMPT_MIN_PANTRY_ACTIONS;
  } catch {
    return false;
  }
}
