import { expect, it } from "vitest";
import { codeLanguageNames, generateTypes } from "./logic";

const sample = '{"id": 1, "name": "A", "tags": ["x"], "owner": {"login": "k"}}';

it("generates Swift structs", async () => {
  const swift = await generateTypes(sample, { language: "swift", typeName: "Repo", typesOnly: true });
  expect(swift).toContain("struct Repo");
  expect(swift).toContain("let tags: [String]");
});

it("supports every listed language", async () => {
  for (const language of Object.keys(codeLanguageNames) as (keyof typeof codeLanguageNames)[]) {
    for (const typesOnly of [true, false]) {
      const code = await generateTypes(sample, { language, typeName: "Repo", typesOnly });
      expect(code.length, `${language} ${typesOnly}`).toBeGreaterThan(20);
    }
  }
});
