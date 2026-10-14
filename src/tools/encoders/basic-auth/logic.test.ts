import { expect, it } from "vitest";
import { basicAuthHeader, parseBasicAuth } from "./logic";

it("builds and parses the header", () => {
  // Example from RFC 7617 section 2.
  expect(basicAuthHeader("Aladdin", "open sesame")).toBe("Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==");
  expect(parseBasicAuth("Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==")).toEqual({ username: "Aladdin", password: "open sesame" });
});
