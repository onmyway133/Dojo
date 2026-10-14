import { expect, it } from "vitest";
import { decodeBase32, encodeBase32, totp } from "./logic";

const ascii = (s: string) => new TextEncoder().encode(s);

it("matches the RFC 6238 test vectors", async () => {
  const sha1 = ascii("12345678901234567890");
  const sha256 = ascii("12345678901234567890123456789012");
  const sha512 = ascii("1234567890".repeat(6) + "1234");
  expect(await totp(sha1, 59, { algorithm: "SHA-1", digits: 8, period: 30 })).toBe("94287082");
  expect(await totp(sha1, 1111111109, { algorithm: "SHA-1", digits: 8, period: 30 })).toBe("07081804");
  expect(await totp(sha256, 59, { algorithm: "SHA-256", digits: 8, period: 30 })).toBe("46119246");
  expect(await totp(sha512, 59, { algorithm: "SHA-512", digits: 8, period: 30 })).toBe("90693936");
});

it("round trips base32", () => {
  expect(encodeBase32(ascii("12345678901234567890"))).toBe("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  expect(new TextDecoder().decode(decodeBase32("gezd gnbv gy3t qojq gezd gnbv gy3t qojq"))).toBe("12345678901234567890");
});
