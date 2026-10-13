import { formatHex } from "culori";
import { useMemo } from "react";
import {
  Chip,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { colorFormats, contrastLevel, parseColor } from "./logic";

const presets = ["#0a84ff", "#30d158", "#ff9f0a", "#ff375f", "#bf5af2", "rebeccapurple", "hsl(200 80% 50%)", "oklch(70% 0.15 150)"];

const checkerboard =
  "repeating-conic-gradient(var(--field-hover) 0% 25%, transparent 0% 50%) 50% / 16px 16px";

function ContrastCard({ label, ratio, background, foreground }: { label: string; ratio: number; background: string; foreground: string }) {
  const level = contrastLevel(ratio);
  return (
    <div className="ds-well m-0 flex items-center gap-3 p-3">
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-lg text-[17px] font-semibold"
        style={{ background, color: foreground }}
      >
        Aa
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium">{label}</div>
        <div className="text-xs text-muted-foreground tabular-nums">{ratio.toFixed(2)} : 1</div>
      </div>
      <Badge variant={level === "Fail" ? "destructive" : "secondary"}>{level}</Badge>
    </div>
  );
}

export default function ColorConverterTool() {
  const [input, setInput] = usePersistentState("input", "#0a84ff");
  const color = useMemo(() => parseColor(input), [input]);
  const formats = color ? colorFormats(color) : undefined;
  const css = formats?.hex;

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Color">
        <div className="flex items-start gap-4">
          <label
            className="relative size-24 shrink-0 overflow-hidden rounded-xl"
            style={{ background: checkerboard }}
            title="Pick a color"
          >
            <span className="absolute inset-0" style={{ background: css ?? "transparent" }} />
            <input
              type="color"
              value={color ? (formatHex(color) ?? "#000000") : "#000000"}
              onChange={(e) => setInput(e.target.value)}
              className="absolute inset-0 cursor-default opacity-0"
              aria-label="Pick a color"
            />
          </label>
          <div className="min-w-0 flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="#0a84ff, rgb(10 132 255), hsl(…), oklch(…), named colors"
              className="h-10 font-mono text-[15px]"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <Chip key={preset} selected={preset === input} onClick={() => setInput(preset)}>
                  <span className="mr-1.5 inline-block size-2.5 rounded-full align-[-1px]" style={{ background: preset }} />
                  {preset}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </ToolSection>

      {!formats && input.trim() && <StatusMessage tone="error">Not a valid CSS color</StatusMessage>}

      {formats && (
        <>
          <div className="grid gap-4 @3xl:grid-cols-2">
            <ToolSection title="CSS">
              <ResultList>
                <ResultRow label="HEX" value={formats.hex} mono />
                <ResultRow label="RGB" value={formats.rgb} mono />
                <ResultRow label="HSL" value={formats.hsl} mono />
                <ResultRow label="HWB" value={formats.hwb} mono />
                <ResultRow label="OKLCH" value={formats.oklch} mono />
                <ResultRow label="LAB" value={formats.lab} mono />
                <ResultRow label="CMYK" value={formats.cmyk} mono />
              </ResultList>
            </ToolSection>
            <ToolSection title="Code">
              <ResultList>
                <ResultRow label="SwiftUI" value={formats.swiftUI} mono />
                <ResultRow label="UIKit" value={formats.uiColor} mono />
                <ResultRow label="AppKit" value={formats.nsColor} mono />
              </ResultList>
            </ToolSection>
          </div>
          <ToolSection title="Contrast" meta="WCAG 2, normal text">
            <div className="grid gap-2 @xl:grid-cols-2">
              <ContrastCard label="White text" ratio={formats.contrastWhite} background={css!} foreground="#fff" />
              <ContrastCard label="Black text" ratio={formats.contrastBlack} background={css!} foreground="#000" />
            </div>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
