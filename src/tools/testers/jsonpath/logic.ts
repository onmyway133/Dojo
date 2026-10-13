import { JSONPath } from "jsonpath-plus";
import { parseJson } from "@/tools/shared/json";

export interface PathMatch {
  path: string;
  value: unknown;
}

export type QueryResult = { ok: true; matches: PathMatch[] } | { ok: false; error: string };

/** Runs a JSONPath query. Filter expressions use the library's safe evaluator, not eval. */
export function queryJson(json: string, path: string): QueryResult {
  const parsed = parseJson(json);
  if (!parsed.ok) return parsed;
  try {
    const results = JSONPath({ path, json: parsed.value as object, resultType: "all", eval: "safe", wrap: true }) as {
      path: string;
      value: unknown;
    }[];
    return { ok: true, matches: results.map((r) => ({ path: r.path, value: r.value })) };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
