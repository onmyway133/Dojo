import { decodeBase64Text, encodeBase64Text } from "@/tools/shared/base64";

export function basicAuthHeader(username: string, password: string): string {
  return `Basic ${encodeBase64Text(`${username}:${password}`)}`;
}

/** Accepts `Authorization: Basic x`, `Basic x` or the bare base64 token. */
export function parseBasicAuth(header: string): { username: string; password: string } {
  const token = header
    .trim()
    .replace(/^authorization:\s*/i, "")
    .replace(/^basic\s+/i, "")
    .trim();
  if (!token) throw new Error("Paste a Basic authorization header");
  const decoded = decodeBase64Text(token);
  const colon = decoded.indexOf(":");
  if (colon < 0) throw new Error("Decoded value has no colon between username and password");
  return { username: decoded.slice(0, colon), password: decoded.slice(colon + 1) };
}
