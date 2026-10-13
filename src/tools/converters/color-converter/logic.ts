import { type Color, converter, formatHex, formatHex8, formatHsl, formatRgb, parse, wcagContrast } from "culori";

const toRgb = converter("rgb");
const toOklch = converter("oklch");
const toLab = converter("lab");
const toHwb = converter("hwb");

const round = (value: number | undefined, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round((value ?? 0) * factor) / factor;
};
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const fixed = (value: number) => clamp01(value).toFixed(3);

export interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  hwb: string;
  oklch: string;
  lab: string;
  cmyk: string;
  swiftUI: string;
  uiColor: string;
  nsColor: string;
  alpha: number;
  contrastWhite: number;
  contrastBlack: number;
}

export function parseColor(input: string): Color | undefined {
  return parse(input.trim());
}

export function colorFormats(color: Color): ColorFormats {
  const rgb = toRgb(color);
  const { r, g, b } = { r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b) };
  const alpha = rgb.alpha ?? 1;
  const hasAlpha = alpha < 1;
  const oklch = toOklch(color);
  const lab = toLab(color);
  const hwb = toHwb(color);
  const alphaSuffix = hasAlpha ? ` / ${round(alpha, 2)}` : "";

  const k = 1 - Math.max(r, g, b);
  const cmy = (v: number) => (k === 1 ? 0 : Math.round(((1 - v - k) / (1 - k)) * 100));

  return {
    hex: (hasAlpha ? formatHex8(color) : formatHex(color)) ?? "",
    rgb: formatRgb(color) ?? "",
    hsl: formatHsl(color) ?? "",
    hwb: `hwb(${round(hwb.h ?? 0, 1)} ${round(hwb.w * 100, 1)}% ${round(hwb.b * 100, 1)}%${alphaSuffix})`,
    oklch: `oklch(${round(oklch.l * 100, 2)}% ${round(oklch.c, 4)} ${round(oklch.h ?? 0, 2)}${alphaSuffix})`,
    lab: `lab(${round(lab.l, 2)} ${round(lab.a, 2)} ${round(lab.b, 2)}${alphaSuffix})`,
    cmyk: `cmyk(${cmy(r)}%, ${cmy(g)}%, ${cmy(b)}%, ${Math.round(k * 100)}%)`,
    swiftUI: `Color(red: ${fixed(r)}, green: ${fixed(g)}, blue: ${fixed(b)}${hasAlpha ? `, opacity: ${fixed(alpha)}` : ""})`,
    uiColor: `UIColor(red: ${fixed(r)}, green: ${fixed(g)}, blue: ${fixed(b)}, alpha: ${fixed(alpha)})`,
    nsColor: `NSColor(srgbRed: ${fixed(r)}, green: ${fixed(g)}, blue: ${fixed(b)}, alpha: ${fixed(alpha)})`,
    alpha,
    contrastWhite: wcagContrast(color, "white"),
    contrastBlack: wcagContrast(color, "black"),
  };
}

/** WCAG 2 level for normal text. */
export function contrastLevel(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}
