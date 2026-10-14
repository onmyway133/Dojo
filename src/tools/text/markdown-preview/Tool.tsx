import { markdown } from "@codemirror/lang-markdown";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useDeferredValue, useMemo } from "react";
import {
  CodeEditor,
  CopyButton,
  InputActions,
  SplitView,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { describeText } from "@/tools/shared/text";

const language = markdown();

const sample = `# Dojo

A **macOS** toolbox with _58_ tools. See [the repo](https://github.com/indiegoodies/Dojo).

## Features
- [x] Formatters and converters
- [x] Encoders, generators, testers
- [ ] Plugins

| Tool | Runs in |
| --- | --- |
| Hash | Rust |
| JSON Formatter | TypeScript |

\`\`\`swift
let greeting = "Hello"
print(greeting)
\`\`\`

> Everything stays on your Mac.
`;

export default function MarkdownPreviewTool() {
  const [source, setSource] = usePersistentState("source", sample);
  const deferred = useDeferredValue(source);
  // marked renders GFM; DOMPurify strips scripts and event handlers before the HTML is shown.
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(deferred, { gfm: true, async: false })), [deferred]);

  return (
    <ToolPage>
      <SplitView>
        <ToolSection title="Markdown" meta={describeText(source)} actions={<InputActions value={source} onChange={setSource} sample={sample} />} fill padded={false}>
          <CodeEditor value={source} onChange={setSource} language={language} lineNumbers={false} />
        </ToolSection>
        <ToolSection title="Preview" actions={<CopyButton label="Copy HTML" value={html} />} fill className="overflow-y-auto">
          {/* biome-ignore lint: sanitized above */}
          <div className="ds-prose" dangerouslySetInnerHTML={{ __html: html }} />
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
