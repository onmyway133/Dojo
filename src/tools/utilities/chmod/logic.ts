export type Who = "owner" | "group" | "others";
export type Bit = "read" | "write" | "execute";
export type Permissions = Record<Who, Record<Bit, boolean>>;

export const whos: Who[] = ["owner", "group", "others"];
export const bits: Bit[] = ["read", "write", "execute"];
const values: Record<Bit, number> = { read: 4, write: 2, execute: 1 };
const letters: Record<Bit, string> = { read: "r", write: "w", execute: "x" };

export function toOctal(p: Permissions): string {
  return whos.map((w) => bits.reduce((n, b) => n + (p[w][b] ? values[b] : 0), 0)).join("");
}

export function toSymbolic(p: Permissions): string {
  return whos.map((w) => bits.map((b) => (p[w][b] ? letters[b] : "-")).join("")).join("");
}

/** Parses "755", "0644" or "rwxr-xr-x"; undefined when invalid. */
export function parsePermissions(text: string): Permissions | undefined {
  const t = text.trim();
  if (/^0?[0-7]{3}$/.test(t)) {
    const digits = t.slice(-3).split("").map(Number);
    return Object.fromEntries(whos.map((w, i) => [w, Object.fromEntries(bits.map((b) => [b, (digits[i] & values[b]) !== 0]))])) as Permissions;
  }
  if (/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(t)) {
    return Object.fromEntries(whos.map((w, i) => [w, Object.fromEntries(bits.map((b, j) => [b, t[i * 3 + j] !== "-"]))])) as Permissions;
  }
  return undefined;
}
