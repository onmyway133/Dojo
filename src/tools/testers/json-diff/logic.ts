import { parseJson } from "@/tools/shared/json";

export type ChangeKind = "added" | "removed" | "changed";

export interface JsonChange {
  kind: ChangeKind;
  path: string;
  before?: unknown;
  after?: unknown;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const identifier = /^[A-Za-z_$][\w$]*$/;
const keyPath = (parent: string, key: string) => (identifier.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`);

/** Recursive structural diff. Arrays compare by index; object key order is ignored. */
export function diffJson(a: unknown, b: unknown, path = "$", out: JsonChange[] = []): JsonChange[] {
  if (isObject(a) && isObject(b)) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const p = keyPath(path, key);
      if (!(key in b)) out.push({ kind: "removed", path: p, before: a[key] });
      else if (!(key in a)) out.push({ kind: "added", path: p, after: b[key] });
      else diffJson(a[key], b[key], p, out);
    }
  } else if (Array.isArray(a) && Array.isArray(b)) {
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i++) {
      const p = `${path}[${i}]`;
      if (i >= b.length) out.push({ kind: "removed", path: p, before: a[i] });
      else if (i >= a.length) out.push({ kind: "added", path: p, after: b[i] });
      else diffJson(a[i], b[i], p, out);
    }
  } else if (JSON.stringify(a) !== JSON.stringify(b)) {
    out.push({ kind: "changed", path, before: a, after: b });
  }
  return out;
}

export type DiffResult = { ok: true; changes: JsonChange[] } | { ok: false; error: string };

export function diffJsonText(left: string, right: string): DiffResult {
  const a = parseJson(left);
  if (!a.ok) return { ok: false, error: `Left: ${a.error}` };
  const b = parseJson(right);
  if (!b.ok) return { ok: false, error: `Right: ${b.error}` };
  return { ok: true, changes: diffJson(a.value, b.value) };
}
