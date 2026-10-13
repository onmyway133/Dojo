import { decodeBase64, encodeBase64 } from "@/tools/shared/base64";

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodePart(part: string, name: string): Record<string, unknown> {
  try {
    const value = JSON.parse(new TextDecoder().decode(decodeBase64(part)));
    if (!value || typeof value !== "object") throw new Error();
    return value;
  } catch {
    throw new Error(`The ${name} isn't Base64URL encoded JSON`);
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) throw new Error(`A JWT has 3 parts separated by dots, this has ${parts.length}`);
  return { header: decodePart(parts[0], "header"), payload: decodePart(parts[1], "payload"), signature: parts[2] };
}

export type ExpiryState = { state: "valid" | "expired" | "not-yet" | "no-expiry"; expiresAt?: Date };

export function expiryState(payload: Record<string, unknown>, now = Date.now()): ExpiryState {
  const exp = typeof payload.exp === "number" ? payload.exp * 1000 : undefined;
  const nbf = typeof payload.nbf === "number" ? payload.nbf * 1000 : undefined;
  if (nbf !== undefined && now < nbf) return { state: "not-yet", expiresAt: exp ? new Date(exp) : undefined };
  if (exp === undefined) return { state: "no-expiry" };
  return { state: now >= exp ? "expired" : "valid", expiresAt: new Date(exp) };
}

const hashes: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

export const canVerify = (alg: unknown) => typeof alg === "string" && alg in hashes;

/** Checks an HS256/384/512 signature with Web Crypto. */
export async function verifyHmac(token: string, secret: string, alg: string): Promise<boolean> {
  const [header, payload, signature] = token.trim().replace(/^Bearer\s+/i, "").split(".");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: hashes[alg] },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`));
  return encodeBase64(new Uint8Array(signed), true) === signature;
}

export const registeredClaims: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires",
  nbf: "Not before",
  iat: "Issued at",
  jti: "JWT ID",
};
