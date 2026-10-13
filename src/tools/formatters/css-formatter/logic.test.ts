import { expect, it } from "vitest";
import { minifyCss } from "./logic";

it("minifies css but keeps strings", () => {
  const css = `/* c */\na > b {\n  color : red ;\n  content: "a  ;  b";\n}\n`;
  expect(minifyCss(css)).toBe('a>b{color:red;content:"a  ;  b"}');
});
