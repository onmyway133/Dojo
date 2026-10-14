import { type Color, converter, wcagContrast } from "culori";

const toRgb = converter("rgb");

export interface ContrastCheck {
  label: string;
  detail: string;
  required: number;
  pass: boolean;
}

/** Puts a translucent foreground on top of the background so the ratio matches what you see. */
export function composite(foreground: Color, background: Color): Color {
  const fg = toRgb(foreground);
  const bg = toRgb(background);
  const a = fg.alpha ?? 1;
  if (a >= 1) return fg;
  const mix = (f: number, b: number) => f * a + b * (1 - a);
  return { mode: "rgb", r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b) };
}

/** WCAG 2 contrast ratio, 1 to 21. The background is treated as opaque. */
export function contrastRatio(foreground: Color, background: Color): number {
  const bg = { ...toRgb(background), alpha: 1 };
  return wcagContrast(composite(foreground, bg), bg);
}

/** WCAG 2.2 success criteria 1.4.3, 1.4.6 and 1.4.11. */
export function contrastChecks(ratio: number): ContrastCheck[] {
  const check = (label: string, detail: string, required: number) => ({ label, detail, required, pass: ratio >= required });
  return [
    check("AA normal text", "Body text under 18pt (24px), or under 14pt bold", 4.5),
    check("AA large text", "18pt (24px) and up, or 14pt (18.66px) bold and up", 3),
    check("AAA normal text", "Enhanced contrast for body text", 7),
    check("AAA large text", "Enhanced contrast for large text", 4.5),
    check("AA UI components", "Icons, focus rings, input borders, chart lines", 3),
  ];
}
