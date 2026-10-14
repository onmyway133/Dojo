import { ArrowUpDown, Check, X } from "lucide-react";
import { useMemo } from "react";
import { IconAction, StatusMessage, ToolOptions, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ColorInput, parseCssColor } from "@/tools/shared/color";
import { contrastChecks, contrastRatio } from "./logic";

export default function ContrastCheckerTool() {
  const [foreground, setForeground] = usePersistentState("foreground", "#1d1d1f");
  const [background, setBackground] = usePersistentState("background", "#f5f5f7");
  const fg = useMemo(() => parseCssColor(foreground), [foreground]);
  const bg = useMemo(() => parseCssColor(background), [background]);
  const ratio = fg && bg ? contrastRatio(fg, bg) : undefined;
  const checks = ratio === undefined ? [] : contrastChecks(ratio);

  const swap = () => {
    setForeground(background);
    setBackground(foreground);
  };

  return (
    <ToolPage layout="scroll">
      <ToolOptions>
        <div className="flex items-center gap-2.5">
          <span className="ds-panel-title w-20 text-[13px] text-muted-foreground">Text</span>
          <ColorInput label="Text color" value={foreground} onChange={setForeground} className="w-64" />
        </div>
        <IconAction label="Swap colors" onClick={swap}>
          <ArrowUpDown />
        </IconAction>
        <div className="flex items-center gap-2.5">
          <span className="ds-panel-title w-20 text-[13px] text-muted-foreground">Background</span>
          <ColorInput label="Background color" value={background} onChange={setBackground} className="w-64" />
        </div>
      </ToolOptions>

      {(!fg || !bg) && <StatusMessage tone="error">{!fg ? "Text" : "Background"} is not a valid CSS color</StatusMessage>}

      {ratio !== undefined && (
        <div className="grid gap-4 @3xl:grid-cols-[3fr_2fr]">
          <ToolSection title="Preview">
            <div className="flex flex-1 flex-col justify-center gap-2 rounded-lg p-6" style={{ background, color: foreground }}>
              <div className="text-[28px] leading-tight font-semibold">Large text, 24px</div>
              <p className="text-[15px] leading-relaxed">
                Body text at 15px. The quick brown fox jumps over the lazy dog. Contrast matters most for small text and thin weights.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-md px-3 py-1 text-[13px] font-medium" style={{ boxShadow: `inset 0 0 0 1.5px ${foreground}` }}>
                  Button
                </span>
                <Check className="size-5" />
              </div>
            </div>
          </ToolSection>
          <ToolSection title="Ratio">
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-[34px] font-semibold tabular-nums">{ratio.toFixed(2)}</span>
              <span className="text-[15px] text-muted-foreground">: 1</span>
            </div>
            <ul className="-mx-2 flex flex-col gap-0.5">
              {checks.map((c) => (
                <li key={c.label} className="ds-row flex items-center gap-3 rounded-lg px-2 py-1.5">
                  <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", c.pass ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                    {c.pass ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.detail}</div>
                  </div>
                  <Badge variant={c.pass ? "secondary" : "destructive"} className="tabular-nums">{c.required}:1</Badge>
                </li>
              ))}
            </ul>
          </ToolSection>
        </div>
      )}
    </ToolPage>
  );
}
