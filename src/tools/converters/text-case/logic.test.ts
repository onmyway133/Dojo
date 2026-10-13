import { expect, it } from "vitest";
import { caseStyles, convertLines, splitWords } from "./logic";

const style = (id: string) => caseStyles.find((s) => s.id === id)!;

it("splits camel case and acronyms", () => {
  expect(splitWords("parseHTTPResponse_v2")).toEqual(["parse", "HTTP", "Response", "v2"]);
});

it("converts each line", () => {
  expect(convertLines("user id\nAPI key", style("camel"))).toBe("userId\napiKey");
  expect(style("constant").convert("max-retry count")).toBe("MAX_RETRY_COUNT");
  expect(style("title").convert("the lord of the rings")).toBe("The Lord of the Rings");
});
