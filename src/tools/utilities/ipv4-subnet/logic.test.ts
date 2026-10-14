import { expect, it } from "vitest";
import { addressKind, formatIpv4, parseCidr } from "./logic";

it("calculates a /26", () => {
  const s = parseCidr("192.168.1.130/26");
  expect(formatIpv4(s.network)).toBe("192.168.1.128");
  expect(formatIpv4(s.broadcast)).toBe("192.168.1.191");
  expect(formatIpv4(s.mask)).toBe("255.255.255.192");
  expect(formatIpv4(s.firstHost)).toBe("192.168.1.129");
  expect(s.hosts).toBe(62);
  expect(addressKind(s.address)).toBe("Private (RFC 1918)");
});

it("accepts dotted masks and edge prefixes", () => {
  expect(parseCidr("10.1.2.3 255.255.0.0").prefix).toBe(16);
  expect(parseCidr("8.8.8.8").hosts).toBe(1);
  expect(parseCidr("0.0.0.0/0").total).toBe(2 ** 32);
  expect(() => parseCidr("10.0.0.1 255.0.255.0")).toThrow();
  expect(() => parseCidr("10.0.0.256/8")).toThrow();
});
