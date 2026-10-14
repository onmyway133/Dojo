import type { CursorGroup } from "./data";

/** Keeps groups with at least one cursor whose value or description matches. */
export function filterCursors(groups: CursorGroup[], query: string): CursorGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({ ...g, cursors: g.cursors.filter((c) => c.value.includes(q) || c.description.toLowerCase().includes(q)) }))
    .filter((g) => g.cursors.length > 0);
}
