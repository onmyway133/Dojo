export type JsonKind = "object" | "array" | "string" | "number" | "boolean" | "null";

export function kindOf(value: unknown): JsonKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as JsonKind;
}

const identifier = /^[A-Za-z_$][\w$]*$/;

/** JavaScript-style accessor path, e.g. `$.owner.login` or `$.tags[0]` or `$["a b"]`. */
export function childPath(parent: string, key: string | number): string {
  if (typeof key === "number") return `${parent}[${key}]`;
  return identifier.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

export function entriesOf(value: unknown): [string | number, unknown][] {
  if (Array.isArray(value)) return value.map((v, i) => [i, v]);
  if (value && typeof value === "object") return Object.entries(value);
  return [];
}

/**
 * Paths to keep visible for a search: every node whose key or primitive value
 * contains the query, plus all of its ancestors.
 */
export function matchingPaths(root: unknown, query: string): Set<string> {
  const needle = query.toLowerCase();
  const result = new Set<string>();

  function visit(value: unknown, path: string, key: string): boolean {
    let matched = key.toLowerCase().includes(needle);
    const kind = kindOf(value);
    if (kind !== "object" && kind !== "array") {
      matched ||= String(value).toLowerCase().includes(needle);
    } else {
      for (const [childKey, child] of entriesOf(value)) {
        if (visit(child, childPath(path, childKey), String(childKey))) matched = true;
      }
    }
    if (matched) result.add(path);
    return matched;
  }

  visit(root, "$", "");
  return result;
}

/** All container paths up to `depth` levels deep, used for the default expansion. */
export function containerPaths(root: unknown, maxDepth = Infinity): Set<string> {
  const result = new Set<string>();
  function visit(value: unknown, path: string, depth: number) {
    const kind = kindOf(value);
    if ((kind !== "object" && kind !== "array") || depth > maxDepth) return;
    result.add(path);
    for (const [key, child] of entriesOf(value)) visit(child, childPath(path, key), depth + 1);
  }
  visit(root, "$", 0);
  return result;
}
