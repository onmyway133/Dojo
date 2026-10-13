import { expect, it } from "vitest";
import { csvToTable, jsonToTable, tableToCsv, tableToJson } from "./logic";

it("flattens nested objects into columns", () => {
  const table = jsonToTable('[{"id":1,"user":{"name":"A, B"}},{"id":2,"tags":["x"]}]');
  expect(table.columns).toEqual(["id", "user.name", "tags"]);
  expect(tableToCsv(table, ",")).toBe('id,user.name,tags\n1,"A, B",\n2,,"[""x""]"');
});

it("parses csv into typed json", () => {
  const json = tableToJson(csvToTable("a;b\n1;x\ntrue;", ";"), true);
  expect(JSON.parse(json)).toEqual([{ a: 1, b: "x" }, { a: true, b: null }]);
});
