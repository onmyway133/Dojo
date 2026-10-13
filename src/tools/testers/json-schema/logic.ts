import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { parseJson } from "@/tools/shared/json";

export interface SchemaError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { status: "valid" }
  | { status: "invalid"; errors: SchemaError[] }
  | { status: "error"; error: string };

/** Validates with Ajv (draft 2020-12, also reads 07/2019 schemas without $schema quirks) and every format. */
export function validate(dataText: string, schemaText: string): ValidationResult {
  const schema = parseJson(schemaText);
  if (!schema.ok) return { status: "error", error: `Schema: ${schema.error}` };
  const data = parseJson(dataText);
  if (!data.ok) return { status: "error", error: `JSON: ${data.error}` };
  try {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    const check = ajv.compile(schema.value as object);
    if (check(data.value)) return { status: "valid" };
    return {
      status: "invalid",
      errors: (check.errors ?? []).map((e) => ({
        path: e.instancePath || "/",
        message: `${e.message ?? "is invalid"}${e.params && "allowedValues" in e.params ? `: ${(e.params.allowedValues as unknown[]).join(", ")}` : ""}`,
      })),
    };
  } catch (error) {
    return { status: "error", error: `Schema: ${(error as Error).message}` };
  }
}
