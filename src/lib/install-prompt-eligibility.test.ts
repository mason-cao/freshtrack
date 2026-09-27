import { describe, expect, it } from "vitest";
import {
  INSTALL_PROMPT_MIN_PANTRY_ACTIONS,
  hasEnoughPantryActions,
  recordPantryAction,
} from "./install-prompt-eligibility";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

const throwingStorage = {
  getItem: () => {
    throw new Error("storage blocked");
  },
  setItem: () => {
    throw new Error("storage blocked");
  },
};

describe("install prompt eligibility", () => {
  it("waits for a few pantry actions before offering install", () => {
    const storage = memoryStorage();

    for (let i = 1; i < INSTALL_PROMPT_MIN_PANTRY_ACTIONS; i++) {
      recordPantryAction(storage);
      expect(hasEnoughPantryActions(storage)).toBe(false);
    }

    recordPantryAction(storage);
    expect(hasEnoughPantryActions(storage)).toBe(true);
  });

  it("stays eligible after further actions", () => {
    const storage = memoryStorage();
    for (let i = 0; i < INSTALL_PROMPT_MIN_PANTRY_ACTIONS + 5; i++) {
      recordPantryAction(storage);
    }
    expect(hasEnoughPantryActions(storage)).toBe(true);
  });

  it("treats a corrupted counter as zero", () => {
    const storage = memoryStorage({ "freshtrack:install-prompt:pantry-actions": "abc" });
    expect(hasEnoughPantryActions(storage)).toBe(false);
    recordPantryAction(storage);
    expect(hasEnoughPantryActions(storage)).toBe(false);
  });

  it("never offers install when storage is unavailable", () => {
    expect(() => recordPantryAction(throwingStorage)).not.toThrow();
    expect(hasEnoughPantryActions(throwingStorage)).toBe(false);
    expect(hasEnoughPantryActions(null)).toBe(false);
  });
});
