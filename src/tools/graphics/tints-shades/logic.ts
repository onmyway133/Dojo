import { type Color, clampChroma, converter, formatHex, formatRgb } from "culori";

const toRgb = converter("rgb");
const toOklch = converter("oklch");

export type MixMode = "rgb" | "oklch";

export interface ScaleStep {
  kind: "tint" | "base" | "shade";
  /** How far toward white (tint) or black (shade), 0 to 100. */
  percent: number;
  hex: string;
  rgb: string;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Mixes toward white (`toward = 1`) or black (`toward = 0`) by `f` (0 to 1). */
function mix(color: Color, toward: 0 | 1, f: number, mode: MixMode): Color {
  if (mode === "rgb") {
    // tint = c + (1 - c) * f, shade = c * (1 - f)
    const { r, g, b } = toRgb(color);
    const m = (c: number) => clamp01(c) + (toward - clamp01(c)) * f;
    return { mode: "rgb", r: m(r), g: m(g), b: m(b) };
  }
  // OKLCH: move lightness, fade chroma, keep hue; then bring it back into sRGB.
  const { l, c, h } = toOklch(color);
  return clampChroma({ mode: "oklch", l: l + (toward - l) * f, c: c * (1 - f), h }, "oklch");
}

/**
 * Tints from lightest to the base, then shades to the darkest: `steps` on each side, evenly
 * spaced and leaving out pure white and black (9 steps gives 10% to 90%).
 */
export function tintsAndShades(color: Color, steps: number, mode: MixMode): ScaleStep[] {
  const step = (kind: ScaleStep["kind"], percent: number, c: Color): ScaleStep => ({
    kind,
    percent,
    hex: formatHex(c) ?? "",
    rgb: formatRgb(c) ?? "",
  });
  const f = (i: number) => i / (steps + 1);
  const percent = (i: number) => Math.round(f(i) * 1000) / 10;
  const tints = Array.from({ length: steps }, (_, i) => steps - i).map((i) => step("tint", percent(i), mix(color, 1, f(i), mode)));
  const shades = Array.from({ length: steps }, (_, i) => i + 1).map((i) => step("shade", percent(i), mix(color, 0, f(i), mode)));
  return [...tints, step("base", 0, color), ...shades];
}

export type ExportFormat = "css" | "scss" | "json";

const key = (s: ScaleStep) => (s.kind === "base" ? "base" : `${s.kind}-${s.percent}`.replace(".", "_"));

export function exportScale(scale: ScaleStep[], format: ExportFormat, name: string): string {
  const prefix = name.trim().replace(/[^\w-]+/g, "-") || "color";
  switch (format) {
    case "css":
      return `:root {\n${scale.map((s) => `  --${prefix}-${key(s)}: ${s.hex};`).join("\n")}\n}`;
    case "scss":
      return scale.map((s) => `$${prefix}-${key(s)}: ${s.hex};`).join("\n");
    case "json":
      return JSON.stringify(Object.fromEntries(scale.map((s) => [key(s), s.hex])), null, 2);
  }
}
