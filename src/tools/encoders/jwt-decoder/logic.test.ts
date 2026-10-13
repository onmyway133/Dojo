import { expect, it } from "vitest";
import { decodeJwt, expiryState, verifyHmac } from "./logic";

// jwt.io's default example, signed with "your-256-bit-secret".
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

it("decodes and verifies", async () => {
  const jwt = decodeJwt(`Bearer ${token}`);
  expect(jwt.header.alg).toBe("HS256");
  expect(jwt.payload.name).toBe("John Doe");
  expect(await verifyHmac(token, "your-256-bit-secret", "HS256")).toBe(true);
  expect(await verifyHmac(token, "wrong", "HS256")).toBe(false);
});

it("reports expiry", () => {
  expect(expiryState({ exp: 100 }, 200_000).state).toBe("expired");
  expect(expiryState({}).state).toBe("no-expiry");
  expect(() => decodeJwt("a.b")).toThrow(/3 parts/);
});
