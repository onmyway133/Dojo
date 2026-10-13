import { secureShuffle } from "@/tools/shared/random";

export type SortMode = "none" | "asc" | "desc" | "natural" | "length" | "shuffle";

export interface LineOptions {
  trim: boolean;
  removeEmpty: boolean;
  dedupe: boolean;
  ignoreCase: boolean;
  sort: SortMode;
  reverse: boolean;
  prefix: string;
  suffix: string;
}

const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** Applies the steps in a fixed order: trim, drop empty, dedupe, sort, reverse, wrap. */
export function transformLines(text: string, o: LineOptions): string {
  let lines = text.split(/\r?\n/);
  if (o.trim) lines = lines.map((l) => l.trim());
  if (o.removeEmpty) lines = lines.filter((l) => l.trim() !== "");
  if (o.dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const key = o.ignoreCase ? l.toLowerCase() : l;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const compare = (a: string, b: string) =>
    o.ignoreCase ? a.localeCompare(b, undefined, { sensitivity: "base" }) : a < b ? -1 : a > b ? 1 : 0;
  switch (o.sort) {
    case "asc": lines = [...lines].sort(compare); break;
    case "desc": lines = [...lines].sort((a, b) => compare(b, a)); break;
    case "natural": lines = [...lines].sort(natural.compare); break;
    case "length": lines = [...lines].sort((a, b) => a.length - b.length || compare(a, b)); break;
    case "shuffle": lines = secureShuffle(lines); break;
  }
  if (o.reverse) lines.reverse();
  if (o.prefix || o.suffix) lines = lines.map((l) => `${o.prefix}${l}${o.suffix}`);
  return lines.join("\n");
}
