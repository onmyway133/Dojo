import { useMemo } from "react";
import { CopyButton, StatusMessage, ToolOptions, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { ColorInput, parseCssColor, Swatch } from "@/tools/shared/color";
import { harmonies } from "./logic";

export default function ColorHarmoniesTool() {
  const [input, setInput] = usePersistentState("color", "#0a84ff");
  const color = useMemo(() => parseCssColor(input), [input]);
  const list = useMemo(() => (color ? harmonies(color) : []), [color]);

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <ColorInput label="Base color" value={input} onChange={setInput} className="w-72" />
      </ToolOptions>
      {!color && input.trim() && <StatusMessage tone="error">Not a valid CSS color</StatusMessage>}
      <div className="grid gap-4 @3xl:grid-cols-2">
        {list.map((h) => (
          <ToolSection key={h.id} title={h.name} meta={h.description} actions={<CopyButton label="Copy Palette" value={h.colors.join(", ")} />}>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${h.colors.length}, minmax(0, 1fr))` }}>
              {h.colors.map((hex, i) => (
                <Swatch key={`${i}-${hex}`} hex={hex} className="min-h-20" />
              ))}
            </div>
          </ToolSection>
        ))}
      </div>
    </ToolPage>
  );
}
