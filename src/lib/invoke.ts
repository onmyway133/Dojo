import { invoke } from "@tauri-apps/api/core";
import { inTauri } from "./platform";

/**
 * Calls a Rust command. Rust errors arrive as plain strings (see `AppError`),
 * so they're wrapped in `Error` to keep `catch` handling uniform.
 */
export async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!inTauri) throw new Error("This tool needs the desktop app.");
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
