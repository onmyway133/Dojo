import { expect, it } from "vitest";
import { parseUrl, withParams } from "./logic";

it("parses and rebuilds query params", () => {
  const { url, params } = parseUrl("https://user:pw@example.com:8080/a/b?q=swift%20ui&page=2#top");
  expect(url.hostname).toBe("example.com");
  expect(params).toEqual([["q", "swift ui"], ["page", "2"]]);
  expect(withParams(url.toString(), [["q", "rust"], ["", "dropped"]])).toBe("https://user:pw@example.com:8080/a/b?q=rust#top");
  expect(() => parseUrl("example.com")).toThrow();
});
