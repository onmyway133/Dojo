import { expect, it } from "vitest";
import { bytesToText, decodeBase32, decodeBase58, encodeBase32, encodeBase58 } from "./logic";

const bytes = (s: string) => new TextEncoder().encode(s);

it("matches the RFC 4648 Base32 test vectors", () => {
  const vectors = ["", "MY======", "MZXQ====", "MZXW6===", "MZXW6YQ=", "MZXW6YTB", "MZXW6YTBOI======"];
  vectors.forEach((expected, i) => {
    const input = "foobar".slice(0, i);
    expect(encodeBase32(bytes(input))).toBe(expected);
    expect(bytesToText(decodeBase32(expected.toLowerCase()))).toBe(input);
  });
  expect(encodeBase32(bytes("fo"), false)).toBe("MZXQ");
  // The decode sample in Tool.tsx.
  expect(bytesToText(decodeBase32("JBSWY3DPEBCG62TP"))).toBe("Hello Dojo");
});

it("round-trips Base58 with leading zeros", () => {
  expect(encodeBase58(bytes("Hello World!"))).toBe("2NEpo7TZRRrLZSi2U");
  expect(encodeBase58(new Uint8Array([0, 0, 1]))).toBe("112");
  expect([...decodeBase58("112")]).toEqual([0, 0, 1]);
  expect(() => decodeBase58("0OIl")).toThrow("isn't a Base58 character");
});
