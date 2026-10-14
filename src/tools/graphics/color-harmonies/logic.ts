import { type Color, converter, formatHex } from "culori";

const toHsl = converter("hsl");

export interface Harmony {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

/** Hue offsets in degrees on the HSL color wheel, base first. */
const rotations: { id: string; name: string; description: string; offsets: number[] }[] = [
  { id: "complementary", name: "Complementary", description: "Opposite on the wheel", offsets: [0, 180] },
  { id: "analogous", name: "Analogous", description: "Neighbours 30° apart", offsets: [-30, 0, 30] },
  { id: "triadic", name: "Triadic", description: "Three evenly spaced hues", offsets: [0, 120, 240] },
  { id: "split", name: "Split Complementary", description: "Base plus the two hues beside its complement", offsets: [0, 150, 210] },
  { id: "tetradic", name: "Tetradic", description: "Two complementary pairs (rectangle)", offsets: [0, 60, 180, 240] },
  { id: "square", name: "Square", description: "Four hues 90° apart", offsets: [0, 90, 180, 270] },
];

const wrap = (h: number) => ((h % 360) + 360) % 360;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function harmonies(color: Color): Harmony[] {
  const { h = 0, s, l } = toHsl(color);
  const hex = (c: { h: number; s: number; l: number }) => formatHex({ mode: "hsl", ...c }) ?? "";
  const rotated = rotations.map(({ offsets, ...rest }) => ({
    ...rest,
    colors: offsets.map((o) => hex({ h: wrap(h + o), s, l })),
  }));
  const monochromatic: Harmony = {
    id: "monochromatic",
    name: "Monochromatic",
    description: "Same hue, lighter and darker",
    colors: [-0.3, -0.15, 0, 0.15, 0.3].map((d) => hex({ h, s, l: clamp(l + d, 0.05, 0.95) })),
  };
  return [...rotated, monochromatic];
}
