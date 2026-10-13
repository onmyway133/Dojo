import { expect, it } from "vitest";
import { jsonToXml, xmlToJson } from "./logic";

it("round trips attributes and wraps multi-key objects", () => {
  const json = xmlToJson('<book id="7"><title>Dune</title><year>1965</year></book>', 2);
  expect(JSON.parse(json)).toEqual({ book: { "@id": "7", title: "Dune", year: 1965 } });
  expect(jsonToXml(json, 2)).toBe('<book id="7">\n  <title>Dune</title>\n  <year>1965</year>\n</book>');
  expect(jsonToXml('{"a":1,"b":2}', 2)).toBe("<root>\n  <a>1</a>\n  <b>2</b>\n</root>");
  expect(() => xmlToJson("<a><b></a>", 2)).toThrow(/line 1/);
});
