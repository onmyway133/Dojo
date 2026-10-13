import { type SetStateAction, useCallback } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

type Values = Record<string, Record<string, unknown>>;

interface ToolStateStore {
  values: Values;
  set: (toolId: string, key: string, value: unknown) => void;
  reset: (toolId?: string) => void;
}

// Tool inputs can be large (a pasted JSON file), so writes to disk are debounced
// instead of serialising the whole store on every keystroke.
function debouncedStorage(delay: number): StateStorage {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      clearTimeout(timers.get(name));
      timers.set(
        name,
        setTimeout(() => {
          try {
            localStorage.setItem(name, value);
          } catch {
            // Quota exceeded: keep working in memory.
          }
        }, delay),
      );
    },
    removeItem: (name) => localStorage.removeItem(name),
  };
}

const useToolStateStore = create<ToolStateStore>()(
  persist(
    (set) => ({
      values: {},
      set: (toolId, key, value) =>
        set((s) => ({ values: { ...s.values, [toolId]: { ...s.values[toolId], [key]: value } } })),
      reset: (toolId) =>
        set((s) => {
          if (!toolId) return { values: {} };
          const { [toolId]: _, ...rest } = s.values;
          return { values: rest };
        }),
    }),
    { name: "tool-state", storage: createJSONStorage(() => debouncedStorage(400)) },
  ),
);

/**
 * Like useState, but the value survives switching tools and relaunching the app.
 * Use it for user input and options; keep derived output out of it.
 */
export function useToolState<T>(
  toolId: string,
  key: string,
  initial: T,
): [T, (value: SetStateAction<T>) => void] {
  const stored = useToolStateStore((s) => s.values[toolId]?.[key]) as T | undefined;
  const value = stored === undefined ? initial : stored;
  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const store = useToolStateStore.getState();
      const current = (store.values[toolId]?.[key] as T | undefined) ?? initial;
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      store.set(toolId, key, resolved);
    },
    // `initial` is a default, not a dependency: callers often pass a fresh literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toolId, key],
  );
  return [value, setValue];
}

export const resetToolState = (toolId?: string) => useToolStateStore.getState().reset(toolId);
