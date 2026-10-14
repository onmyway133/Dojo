const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function encodeBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += base32Alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += base32Alphabet[(value << (5 - bits)) & 31];
  return out;
}

/** Ignores spaces, dashes, padding and case, as authenticator apps do. */
export function decodeBase32(text: string): Uint8Array {
  const clean = text.toUpperCase().replace(/[\s=-]/g, "");
  if (!clean) throw new Error("Enter a base32 secret");
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    const index = base32Alphabet.indexOf(char);
    if (index < 0) throw new Error(`"${char}" isn't a base32 character (A–Z, 2–7)`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export type TotpAlgorithm = "SHA-1" | "SHA-256" | "SHA-512";

export interface TotpOptions {
  algorithm: TotpAlgorithm;
  digits: number;
  period: number;
}

/** HOTP (RFC 4226) for one counter value. */
export async function hotp(key: Uint8Array, counter: number, algorithm: TotpAlgorithm, digits: number): Promise<string> {
  const message = new DataView(new ArrayBuffer(8));
  message.setUint32(0, Math.floor(counter / 2 ** 32));
  message.setUint32(4, counter >>> 0);
  const cryptoKey = await crypto.subtle.importKey("raw", key as BufferSource, { name: "HMAC", hash: algorithm }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, message.buffer));
  const offset = mac[mac.length - 1] & 0x0f;
  const binary =
    ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(binary % 10 ** digits).padStart(digits, "0");
}

/** TOTP (RFC 6238) at a Unix time in seconds. */
export function totp(key: Uint8Array, unixSeconds: number, options: TotpOptions): Promise<string> {
  return hotp(key, Math.floor(unixSeconds / options.period), options.algorithm, options.digits);
}

export function otpauthUri(secret: string, label: string, issuer: string, options: TotpOptions): string {
  const params = new URLSearchParams({ secret: secret.replace(/[\s=-]/g, "").toUpperCase() });
  if (issuer) params.set("issuer", issuer);
  params.set("algorithm", options.algorithm.replace("-", ""));
  params.set("digits", String(options.digits));
  params.set("period", String(options.period));
  const name = issuer ? `${issuer}:${label}` : label;
  return `otpauth://totp/${encodeURIComponent(name)}?${params}`;
}
