import { useMemo } from "react";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  Option,
  Segmented,
  StatusMessage,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ColorInput, parseCssColor, Swatch } from "@/tools/shared/color";
import { type ExportFormat, exportScale, type MixMode, type ScaleStep, tintsAndShades } from "./logic";

const modeChoices: Choice<MixMode>[] = [
  { value: "rgb", label: "Linear RGB" },
  { value: "oklch", label: "OKLCH" },
];

const formatChoices: Choice<ExportFormat>[] = [
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
];

const stepLabel = (s: ScaleStep) => (s.kind === "base" ? "Base" : `${s.kind === "tint" ? "Tint" : "Shade"} ${s.percent}%`);

export default function TintsShadesTool() {
  const [input, setInput] = usePersistentState("color", "#0a84ff");
  const [steps, setSteps] = usePersistentState("steps", 9);
  const [mode, setMode] = usePersistentState<MixMode>("mode", "rgb");
  const [format, setFormat] = usePersistentState<ExportFormat>("format", "css");
  const [name, setName] = usePersistentState("name", "brand");

  const color = useMemo(() => parseCssColor(input), [input]);
  const scale = useMemo(() => (color ? tintsAndShades(color, steps, mode) : []), [color, steps, mode]);
  const base = scale.find((s) => s.kind === "base");
  const groups = base
    ? [
        { title: "Tints", steps: [...scale.filter((s) => s.kind === "tint"), base] },
        { title: "Shades", steps: [base, ...scale.filter((s) => s.kind === "shade")] },
      ]
    : [];
  const exported = scale.length ? exportScale(scale, format, name) : "";

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <ColorInput label="Base color" value={input} onChange={setInput} className="w-72" />
        <Option label={`Steps ${steps}`}>
          <Slider value={[steps]} min={1} max={12} step={1} onValueChange={([v]) => setSteps(v)} className="w-36" />
        </Option>
        <Option label="Mix">
          <Segmented value={mode} onChange={setMode} choices={modeChoices} />
        </Option>
      </ToolOptions>

      {!color && input.trim() && <StatusMessage tone="error">Not a valid CSS color</StatusMessage>}

      {color && (
        <>
          <ToolSection title="Scale" meta="Click a color to copy it" className="shrink-0">
            <div className="flex flex-col gap-3">
              {groups.map((group) => (
                <div key={group.title}>
                  <div className="mb-1.5 text-xs text-muted-foreground">{group.title}</div>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${group.steps.length}, minmax(0, 1fr))` }}>
                    {group.steps.map((s) => (
                      <Swatch key={`${s.kind}-${s.percent}`} hex={s.hex} label={stepLabel(s)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ToolSection>
          <ToolSection
            title="Export"
            actions={<CopyButton value={exported} />}
            className="h-80 shrink-0"
            padded={false}
          >
            <div className="flex items-center gap-3 px-4 pb-2">
              <Segmented value={format} onChange={setFormat} choices={formatChoices} />
              <Input value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} aria-label="Name" placeholder="Name" className="h-7 w-40 font-mono text-[13px]" />
            </div>
            <CodeEditor value={exported} readOnly lineNumbers={false} />
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
