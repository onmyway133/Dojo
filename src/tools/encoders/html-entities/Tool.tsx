import { html } from "@codemirror/lang-html";
import { decodeHTML, encodeHTML, escapeUTF8 } from "entities";
import { useCallback } from "react";
import { type Choice, Option, OptionSwitch, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";

type Mode = "encode" | "decode";
const modeChoices: Choice<Mode>[] = [
  { value: "encode", label: "Escape" },
  { value: "decode", label: "Unescape" },
];

const language = html();

export default function HtmlEntitiesTool() {
  const [mode, setMode] = usePersistentState<Mode>("mode", "encode");
  // Off: only &, <, >, " and ' are escaped. On: every non-ASCII character too.
  const [all, setAll] = usePersistentState("encodeAll", false);
  const encode = mode === "encode";
  const transform = useCallback(
    (input: string) => (encode ? (all ? encodeHTML(input) : escapeUTF8(input)) : decodeHTML(input)),
    [encode, all],
  );

  return (
    <TransformTool
      transform={transform}
      inputLanguage={encode ? undefined : language}
      outputLanguage={encode ? language : undefined}
      sample={encode ? `<a href="/?q=1&lang=en">Café — “quotes”</a>` : "&lt;p&gt;Caf&eacute; &amp; &#x1F44B;&lt;/p&gt;"}
      options={
        <ToolOptions>
          <Option label="Mode">
            <Segmented value={mode} onChange={setMode} choices={modeChoices} />
          </Option>
          {encode && <OptionSwitch label="Encode all non-ASCII" checked={all} onChange={setAll} />}
        </ToolOptions>
      }
    />
  );
}
