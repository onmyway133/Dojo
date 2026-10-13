import { expect, it } from "vitest";
import { decodeBase64Text, encodeBase64Text } from "./base64";

it("round trips unicode and url-safe base64", () => {
  expect(encodeBase64Text("héllo 👋")).toBe("aMOpbGxvIPCfkYs=");
  expect(encodeBase64Text("héllo 👋", true)).toBe("aMOpbGxvIPCfkYs");
  expect(decodeBase64Text("aMOpbGxvIPCfkYs")).toBe("héllo 👋");
  expect(() => decodeBase64Text("not*base64")).toThrow();
});
