import { markdown } from "@codemirror/lang-markdown";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useDeferredValue, useEffect, useMemo, useRef } from "react";
import { useResolvedTheme } from "@/app/useTheme";
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
import { renderMermaid } from "./mermaid";

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

\`\`\`mermaid
flowchart LR
  Paste --> Format --> Copy
\`\`\`

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
  const previewRef = useRef<HTMLDivElement>(null);
  const theme = useResolvedTheme();

  // Swap each ```mermaid block for its diagram. The <pre> stays (hidden) as the source,
  // so a theme change can render again and "Copy HTML" still has the code.
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    const blocks = [...root.querySelectorAll<HTMLElement>("pre > code.language-mermaid")];
    if (blocks.length === 0) return;
    let cancelled = false;
    for (const code of blocks) {
      const pre = code.parentElement!;
      const source = code.textContent ?? "";
      renderMermaid(source, theme).then(
        (svg) => !cancelled && showDiagram(pre, svg),
        (error: unknown) => !cancelled && showError(pre, error instanceof Error ? error.message : String(error)),
      );
    }
    return () => {
      cancelled = true;
    };
  }, [html, theme]);

  return (
    <ToolPage>
      <SplitView>
        <ToolSection title="Markdown" meta={describeText(source)} actions={<InputActions value={source} onChange={setSource} sample={sample} />} fill padded={false}>
          <CodeEditor value={source} onChange={setSource} language={language} lineNumbers={false} />
        </ToolSection>
        <ToolSection title="Preview" actions={<CopyButton label="Copy HTML" value={html} />} fill className="overflow-y-auto">
          {/* biome-ignore lint: sanitized above */}
          <div ref={previewRef} className="ds-prose" dangerouslySetInnerHTML={{ __html: html }} />
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}

/** Puts the diagram right before its source block and hides the source. */
function showDiagram(pre: HTMLElement, svg: string) {
  const figure = slot(pre);
  figure.className = "ds-mermaid";
  // biome-ignore lint: mermaid output with securityLevel "strict"
  figure.innerHTML = svg;
  pre.hidden = true;
}

function showError(pre: HTMLElement, message: string) {
  const figure = slot(pre);
  figure.className = "ds-mermaid-error";
  figure.textContent = `Mermaid: ${message}`;
  pre.hidden = false;
}

function slot(pre: HTMLElement): HTMLElement {
  const previous = pre.previousElementSibling;
  if (previous instanceof HTMLElement && previous.dataset.mermaid !== undefined) return previous;
  const figure = document.createElement("div");
  figure.dataset.mermaid = "";
  pre.before(figure);
  return figure;
}
