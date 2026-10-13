import { useCallback } from "react";
import { type Choice, Option, OptionSwitch, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { escapeString, type Quote, unescapeString } from "./logic";

type Mode = "escape" | "unescape";
const modeChoices: Choice<Mode>[] = [
  { value: "escape", label: "Escape" },
  { value: "unescape", label: "Unescape" },
];
const quoteChoices: Choice<Quote>[] = [
  { value: "double", label: 'Double "' },
  { value: "single", label: "Single '" },
];

export default function StringEscapeTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "unescape");
  const [quote, setQuote] = usePersistentState<Quote>("quote", "double");
  const [unicode, setUnicode] = usePersistentState("escapeUnicode", false);
  const escape = mode === "escape";

  const transform = useCallback(
    (input: string) => (escape ? escapeString(input, quote, unicode) : unescapeString(input)),
    [escape, quote, unicode],
  );

  return (
    <TransformTool
      transform={transform}
      sample={escape ? 'He said "hi"\n\tthen left. Café ☕' : '{\\"name\\":\\"Caf\\u00e9\\",\\n\\t\\"ok\\":true}'}
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          {escape && (
            <>
              <Option label="Quotes">
                <Segmented value={quote} onChange={setQuote} choices={quoteChoices} />
              </Option>
              <OptionSwitch label="Escape non-ASCII" checked={unicode} onChange={setUnicode} />
            </>
          )}
        </ToolOptions>
      }
    />
  );
}
