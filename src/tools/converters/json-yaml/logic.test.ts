import { expect, it } from "vitest";
import { jsonToYaml, yamlToJson } from "./logic";

it("round trips", () => {
  const yaml = jsonToYaml('{"a":1,"b":["x",true],"c":null}', 2);
  expect(yaml).toBe("a: 1\nb:\n  - x\n  - true\nc: null\n");
  expect(JSON.parse(yamlToJson(yaml, 2))).toEqual({ a: 1, b: ["x", true], c: null });
});
