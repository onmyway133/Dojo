import type { MimeDatabase } from "mime-db";

export interface MimeType {
  type: string;
  extensions: string[];
  compressible?: boolean;
  charset?: string;
  source?: string;
}

export function mimeList(db: MimeDatabase): MimeType[] {
  return Object.entries(db).map(([type, entry]) => ({
    type,
    extensions: [...(entry.extensions ?? [])],
    compressible: entry.compressible,
    charset: entry.charset,
    source: entry.source,
  }));
}

/** Shown before anything is typed. */
export const commonTypes = [
  "text/html", "text/css", "text/javascript", "application/json", "application/xml", "text/plain",
  "text/csv", "text/markdown", "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
  "image/avif", "font/woff2", "audio/mpeg", "video/mp4", "application/pdf", "application/zip",
  "application/wasm", "application/octet-stream", "multipart/form-data", "application/x-www-form-urlencoded",
];

/**
 * Exact extension matches first (".png", "png" or "photo.png"), then types that start with
 * the query, then types and extensions that contain it. Types with extensions rank higher.
 */
export function searchMime(list: MimeType[], query: string, limit = 100): MimeType[] {
  const q = query.trim().toLowerCase();
  if (!q) return commonTypes.map((t) => list.find((m) => m.type === t)).filter((m) => m !== undefined);
  const ext = q.includes(".") && !q.includes("/") ? q.slice(q.lastIndexOf(".") + 1) : q;

  const score = (m: MimeType): number => {
    if (m.extensions.includes(ext)) return 0;
    if (m.type === q) return 1;
    if (m.type.startsWith(q)) return 2;
    if (m.type.includes(q)) return 3;
    if (m.extensions.some((e) => e.startsWith(ext))) return 4;
    return -1;
  };
  return list
    .map((m) => ({ m, s: score(m) }))
    .filter(({ s }) => s >= 0)
    .sort((a, b) => a.s - b.s || Number(b.m.extensions.length > 0) - Number(a.m.extensions.length > 0) || a.m.type.localeCompare(b.m.type))
    .slice(0, limit)
    .map(({ m }) => m);
}
