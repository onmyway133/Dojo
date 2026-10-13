import { createContext, type SetStateAction, use } from "react";
import { useToolState } from "@/stores/toolState";
import type { ToolMeta } from "@/tools/types";

export const ToolContext = createContext<ToolMeta | null>(null);

/** Metadata of the tool being rendered. */
export function useToolMeta(): ToolMeta {
  const meta = use(ToolContext);
  if (!meta) throw new Error("useToolMeta must be used inside a tool route");
  return meta;
}

/** Persisted state scoped to the current tool. See `useToolState`. */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (value: SetStateAction<T>) => void] {
  return useToolState(useToolMeta().id, key, initial);
}
