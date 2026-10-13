import { type DependencyList, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading"; value?: T }
  | { status: "success"; value: T }
  | { status: "error"; error: string };

/**
 * Runs `task` whenever `deps` change and keeps only the latest result, so a slow
 * earlier call can't overwrite a newer one. Return `undefined` from the task to stay idle.
 */
export function useAsync<T>(task: () => Promise<T> | undefined, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  useEffect(() => {
    const promise = task();
    if (!promise) {
      setState({ status: "idle" });
      return;
    }
    let current = true;
    setState((prev) => ({
      status: "loading",
      value: prev.status === "success" || prev.status === "loading" ? prev.value : undefined,
    }));
    promise.then(
      (value) => current && setState({ status: "success", value }),
      (error: unknown) =>
        current && setState({ status: "error", error: error instanceof Error ? error.message : String(error) }),
    );
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
