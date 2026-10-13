import { expect, it } from "vitest";
import { queryJson } from "./logic";

const json = '{"store":{"book":[{"title":"A","price":8},{"title":"B","price":22}]}}';

it("queries with filters", () => {
  const result = queryJson(json, "$.store.book[?(@.price < 10)].title");
  expect(result.ok && result.matches).toEqual([{ path: "$['store']['book'][0]['title']", value: "A" }]);
  expect(queryJson("{", "$").ok).toBe(false);
});
