import { base64ToBytes, bytesToBase64 } from "@/lib/files";

export function encodeBase64(bytes: Uint8Array, urlSafe = false): string {
  const base64 = bytesToBase64(bytes);
  return urlSafe ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base64;
}

/** Accepts standard and URL-safe alphabets, missing padding and line breaks. */
export function decodeBase64(text: string): Uint8Array {
  let clean = text.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*=*$/.test(clean)) throw new Error("Contains characters that aren't base64");
  clean = clean.replace(/=+$/, "");
  if (clean.length % 4 === 1) throw new Error("Base64 length is invalid");
  clean += "=".repeat((4 - (clean.length % 4)) % 4);
  return base64ToBytes(clean);
}

export const encodeBase64Text = (text: string, urlSafe = false) => encodeBase64(new TextEncoder().encode(text), urlSafe);

export function decodeBase64Text(text: string): string {
  const bytes = decodeBase64(text);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Decoded bytes aren't UTF-8 text");
  }
}
