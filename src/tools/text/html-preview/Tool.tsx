import { html } from "@codemirror/lang-html";
import { useDeferredValue } from "react";
import {
  CodeEditor,
  CopyButton,
  InputActions,
  OptionSwitch,
  SplitView,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";

const language = html();
const sample = `<!doctype html>
<html>
  <head>
    <style>
      body { font: 15px -apple-system, sans-serif; margin: 24px; color: #1d1d1f; }
      .card { padding: 16px 20px; border-radius: 12px; background: #f2f2f7; max-width: 360px; }
      button { margin-top: 8px; padding: 6px 14px; border: 0; border-radius: 999px; background: #0a84ff; color: white; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Hello</h2>
      <p>Edit the HTML on the left.</p>
      <button onclick="this.textContent = 'Clicked'">Click me</button>
    </div>
  </body>
</html>`;

export default function HtmlPreviewTool() {
  const [source, setSource] = usePersistentState("source", sample);
  const [scripts, setScripts] = usePersistentState("scripts", false);
  const deferred = useDeferredValue(source);

  return (
    <ToolPage>
      <ToolOptions>
        <OptionSwitch label="Run scripts" checked={scripts} onChange={setScripts} />
        <span className="text-xs text-muted-foreground">The preview is sandboxed and can't reach the app.</span>
      </ToolOptions>
      <SplitView>
        <ToolSection title="HTML" actions={<><CopyButton value={source} /><InputActions value={source} onChange={setSource} sample={sample} /></>} fill padded={false}>
          <CodeEditor value={source} onChange={setSource} language={language} />
        </ToolSection>
        <ToolSection title="Preview" fill padded={false}>
          {/* No allow-same-origin: the document gets an opaque origin, isolated from the app. */}
          <iframe
            title="HTML preview"
            sandbox={scripts ? "allow-scripts" : ""}
            srcDoc={deferred}
            className="ds-well min-h-0 flex-1 bg-white"
          />
        </ToolSection>
      </SplitView>
    </ToolPage>
  );
}
