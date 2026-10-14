const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** RFC 4648 Base32. */
export function encodeBase32(bytes: Uint8Array, padding = true): string {
  let out = "";
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(buffer << (5 - bits)) & 31];
  return padding ? out.padEnd(Math.ceil(out.length / 8) * 8, "=") : out;
}

/** Case-insensitive, ignores whitespace and padding. */
export function decodeBase32(text: string): Uint8Array {
  const clean = text.replace(/\s+/g, "").replace(/=+$/, "").toUpperCase();
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = BASE32.indexOf(char);
    if (value < 0) throw new Error(`"${char}" isn't a Base32 character`);
    buffer = ((buffer << 5) | value) & 0xfff;
    bits += 5;
    if (bits >= 8) {
      out.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

/** Bitcoin alphabet. Leading zero bytes become leading "1"s. */
export function encodeBase58(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  let n = 0n;
  for (const byte of bytes) n = (n << 8n) | BigInt(byte);
  let out = "";
  while (n > 0n) {
    out = BASE58[Number(n % 58n)] + out;
    n /= 58n;
  }
  return "1".repeat(zeros) + out;
}

export function decodeBase58(text: string): Uint8Array {
  const clean = text.replace(/\s+/g, "");
  let zeros = 0;
  while (zeros < clean.length && clean[zeros] === "1") zeros++;
  let n = 0n;
  for (const char of clean) {
    const value = BASE58.indexOf(char);
    if (value < 0) throw new Error(`"${char}" isn't a Base58 character`);
    n = n * 58n + BigInt(value);
  }
  const out: number[] = [];
  while (n > 0n) {
    out.unshift(Number(n & 0xffn));
    n >>= 8n;
  }
  return new Uint8Array([...new Array(zeros).fill(0), ...out]);
}

export function bytesToText(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Decoded bytes aren't UTF-8 text");
  }
}
