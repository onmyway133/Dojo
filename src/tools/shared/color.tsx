import { type Color, formatHex, parse, wcagContrast } from "culori";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

const checkerboard = "repeating-conic-gradient(var(--field-hover) 0% 25%, transparent 0% 50%) 50% / 12px 12px";

export function parseCssColor(input: string): Color | undefined {
  return parse(input.trim());
}

/** Black or white, whichever reads better on `background`. */
export function readableOn(background: string): string {
  return wcagContrast(background, "black") >= wcagContrast(background, "white") ? "#000" : "#fff";
}

/** Swatch with the native color picker plus a text field that takes any CSS color. */
export function ColorInput({
  value,
  onChange,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  const color = parseCssColor(value);
  const hex = color ? (formatHex(color) ?? "#000000") : "#000000";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <label className="relative size-9 shrink-0 overflow-hidden rounded-lg" style={{ background: checkerboard }} title={`Pick ${label.toLowerCase()}`}>
        <span className="absolute inset-0" style={{ background: color ? value : "transparent" }} />
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-default opacity-0"
          aria-label={`Pick ${label.toLowerCase()}`}
        />
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        aria-label={label}
        aria-invalid={(value.trim() !== "" && !color) || undefined}
        placeholder="#0a84ff, rgb(…), hsl(…), oklch(…)"
        className="h-9 min-w-0 flex-1 font-mono text-[14px]"
      />
    </div>
  );
}

/** A color tile; clicking copies its hex value. */
export function Swatch({ hex, label, className }: { hex: string; label?: string; className?: string }) {
  async function copy() {
    try {
      await copyText(hex);
      toast.success("Copied", { description: hex });
    } catch (error) {
      toast.error("Couldn't copy", { description: String(error) });
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${hex}`}
      className={cn(
        "group flex min-h-16 min-w-0 flex-col justify-end rounded-lg p-2 text-left outline-none transition-transform",
        "hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
      style={{ background: hex, color: readableOn(hex) }}
    >
      {label && <span className="truncate text-[11px] font-medium opacity-80">{label}</span>}
      <span className="truncate font-mono text-[12px]">{hex}</span>
    </button>
  );
}
