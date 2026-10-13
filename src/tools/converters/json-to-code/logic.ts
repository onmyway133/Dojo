import { InputData, jsonInputForTargetLanguage, quicktype } from "quicktype-core";

export type CodeLanguage = "swift" | "typescript" | "kotlin" | "go" | "rust" | "python" | "csharp" | "java" | "dart";

export const codeLanguageNames: Record<CodeLanguage, string> = {
  swift: "Swift",
  typescript: "TypeScript",
  kotlin: "Kotlin",
  go: "Go",
  rust: "Rust",
  python: "Python",
  csharp: "C#",
  java: "Java",
  dart: "Dart",
};

// Languages whose renderer has a "just-types" switch that drops serialisation helpers.
const supportsTypesOnly = new Set<CodeLanguage>(["swift", "typescript", "kotlin", "go", "python", "csharp", "java", "dart"]);

export interface GenerateOptions {
  language: CodeLanguage;
  typeName: string;
  typesOnly: boolean;
}

/** Infers types from a JSON sample and renders them in the chosen language. */
export async function generateTypes(json: string, { language, typeName, typesOnly }: GenerateOptions): Promise<string> {
  JSON.parse(json); // fail fast with a plain JSON error
  const input = jsonInputForTargetLanguage(language);
  await input.addSource({ name: typeName.trim() || "Root", samples: [json] });
  const inputData = new InputData();
  inputData.addInput(input);
  const result = await quicktype({
    inputData,
    lang: language,
    rendererOptions: typesOnly && supportsTypesOnly.has(language) ? { "just-types": "true" } : {},
  });
  return result.lines.join("\n");
}
