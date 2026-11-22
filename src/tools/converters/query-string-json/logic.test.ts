import { describe, expect, it } from "vitest";
import { jsonToQuery, queryToJson } from "./logic";

describe("query string ⇄ JSON", () => {
  it("parses URLs and repeated keys", () => {
    expect(JSON.parse(queryToJson("https://example.com/p?tag=a&tag=b&q=hello%20world#top"))).toEqual({
      tag: ["a", "b"],
      q: "hello world",
    });
    expect(JSON.parse(queryToJson("a=1&b="))).toEqual({ a: "1", b: "" });
  });

  it("round trips", () => {
    expect(jsonToQuery('{"tag":["a","b"],"q":"hello world","n":2}')).toBe("tag=a&tag=b&q=hello+world&n=2");
    expect(() => jsonToQuery("[1]")).toThrow();
  });
});
