/**
 * Colour vision deficiency simulation matrices (Machado, Oliveira & Fernandes 2009,
 * severity 1.0). They apply in linear RGB, which is what SVG filters use by default.
 */
export interface Simulation {
  id: string;
  name: string;
  description: string;
  /** 3×3 row-major RGB matrix. */
  matrix: number[];
}

export const simulations: Simulation[] = [
  { id: "protanopia", name: "Protanopia", description: "No red cones (about 1% of men)", matrix: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998] },
  { id: "deuteranopia", name: "Deuteranopia", description: "No green cones (about 1% of men)", matrix: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881] },
  { id: "tritanopia", name: "Tritanopia", description: "No blue cones (rare)", matrix: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039] },
  { id: "achromatopsia", name: "Achromatopsia", description: "No color, only brightness", matrix: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722] },
];

/** feColorMatrix "values": the 3×3 matrix padded to 4×5 with alpha kept. */
export function colorMatrixValues(m: number[]): string {
  return [m[0], m[1], m[2], 0, 0, m[3], m[4], m[5], 0, 0, m[6], m[7], m[8], 0, 0, 0, 0, 0, 1, 0].join(" ");
}
