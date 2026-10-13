import { json } from "@codemirror/lang-json";
import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  InputActions,
  ResultList,
  ResultRow,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { validate } from "./logic";

const jsonLanguage = json();
const sampleSchema = JSON.stringify(
  {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    required: ["id", "email", "roles"],
    properties: {
      id: { type: "integer", minimum: 1 },
      email: { type: "string", format: "email" },
      roles: { type: "array", items: { enum: ["admin", "editor", "viewer"] }, minItems: 1 },
      website: { type: "string", format: "uri" },
    },
    additionalProperties: false,
  },
  null,
  2,
);
const sampleData = JSON.stringify({ id: 0, email: "ada@example", roles: ["owner"], nickname: "ada" }, null, 2);

export default function JsonSchemaTool() {
  const [schema, setSchema] = usePersistentState("schema", sampleSchema);
  const [data, setData] = usePersistentState("data", sampleData);
  const deferredSchema = useDeferredValue(schema);
  const deferredData = useDeferredValue(data);
  const result = useMemo(() => validate(deferredData, deferredSchema), [deferredData, deferredSchema]);

  return (
    <ToolPage>
      <SplitView>
        <ToolSection title="Schema" actions={<InputActions value={schema} onChange={setSchema} sample={sampleSchema} />} fill padded={false}>
          <CodeEditor value={schema} onChange={setSchema} language={jsonLanguage} />
        </ToolSection>
        <ToolSection title="JSON" actions={<InputActions value={data} onChange={setData} sample={sampleData} />} fill padded={false}>
          <CodeEditor value={data} onChange={setData} language={jsonLanguage} />
        </ToolSection>
      </SplitView>
      <ToolSection
        title="Result"
        meta={result.status === "invalid" ? `${result.errors.length} ${result.errors.length === 1 ? "error" : "errors"}` : undefined}
        className="max-h-72 shrink-0 overflow-y-auto"
      >
        {result.status === "valid" && <StatusMessage tone="success">The JSON matches the schema.</StatusMessage>}
        {result.status === "error" && <StatusMessage tone="error">{result.error}</StatusMessage>}
        {result.status === "invalid" && (
          <ResultList>
            {result.errors.map((e, i) => (
              <ResultRow key={i} label={<code className="font-mono text-[12px]">{e.path}</code>} value={e.message} />
            ))}
          </ResultList>
        )}
      </ToolSection>
    </ToolPage>
  );
}
