import { v4, v7, validate, version } from "uuid";

export type UuidVersion = "v4" | "v7";

export interface UuidFormat {
  uppercase: boolean;
  hyphens: boolean;
}

export function generateUuids(kind: UuidVersion, count: number, format: UuidFormat): string[] {
  return Array.from({ length: count }, () => {
    let id = kind === "v7" ? v7() : v4();
    if (!format.hyphens) id = id.replaceAll("-", "");
    return format.uppercase ? id.toUpperCase() : id;
  });
}

export interface UuidInfo {
  version: number;
  variant: string;
  /** Creation time for time-based versions (v1, v6, v7). */
  timestamp?: Date;
}

/** Accepts braces and missing hyphens, like `{0190…}` or a 32-char hex string. */
export function inspectUuid(text: string): UuidInfo | undefined {
  let clean = text.trim().replace(/^\{|\}$/g, "").replace(/^urn:uuid:/i, "").toLowerCase();
  if (/^[0-9a-f]{32}$/.test(clean)) {
    clean = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  if (!validate(clean)) return undefined;
  const v = version(clean);
  const variantNibble = parseInt(clean[19], 16);
  const variant = variantNibble >= 0xe ? "Reserved" : variantNibble >= 0xc ? "Microsoft" : variantNibble >= 8 ? "RFC 9562" : "NCS";
  let timestamp: Date | undefined;
  if (v === 7) timestamp = new Date(parseInt(clean.replaceAll("-", "").slice(0, 12), 16));
  return { version: v, variant, timestamp };
}
