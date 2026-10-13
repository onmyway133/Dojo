export interface SizeUnit {
  id: string;
  name: string;
  bytes: number;
}

export const decimalUnits: SizeUnit[] = [
  { id: "B", name: "Bytes", bytes: 1 },
  { id: "KB", name: "Kilobytes", bytes: 1e3 },
  { id: "MB", name: "Megabytes", bytes: 1e6 },
  { id: "GB", name: "Gigabytes", bytes: 1e9 },
  { id: "TB", name: "Terabytes", bytes: 1e12 },
  { id: "PB", name: "Petabytes", bytes: 1e15 },
];

export const binaryUnits: SizeUnit[] = [
  { id: "KiB", name: "Kibibytes", bytes: 1024 },
  { id: "MiB", name: "Mebibytes", bytes: 1024 ** 2 },
  { id: "GiB", name: "Gibibytes", bytes: 1024 ** 3 },
  { id: "TiB", name: "Tebibytes", bytes: 1024 ** 4 },
  { id: "PiB", name: "Pebibytes", bytes: 1024 ** 5 },
];

export const bitUnit: SizeUnit = { id: "bit", name: "Bits", bytes: 1 / 8 };

export const allUnits = [bitUnit, ...decimalUnits, ...binaryUnits];

/** Up to 6 significant decimals, no exponent for everyday sizes. */
export function formatAmount(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 1e21 || Math.abs(value) < 1e-6) return value.toExponential(4);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6, useGrouping: true }).format(value);
}

export const convertSize = (amount: number, from: SizeUnit, to: SizeUnit) => (amount * from.bytes) / to.bytes;
