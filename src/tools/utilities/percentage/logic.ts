/** Parses a number typed by a person: allows spaces, thousands commas and a trailing %. */
export function parseNumber(text: string): number | undefined {
  const clean = text.trim().replace(/[\s,]/g, "").replace(/%$/, "");
  if (clean === "" || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(clean)) return undefined;
  return Number(clean);
}

/** X% of Y */
export const percentOf = (percent: number, value: number) => (percent / 100) * value;

/** X is what % of Y; undefined when Y is 0. */
export const whatPercent = (part: number, whole: number) => (whole === 0 ? undefined : (part / whole) * 100);

/** Percent change from X to Y; undefined when X is 0. */
export const percentChange = (from: number, to: number) => (from === 0 ? undefined : ((to - from) / Math.abs(from)) * 100);

/** Rounds away floating point noise (0.1 + 0.2) without forcing a fixed number of decimals. */
export function formatNumber(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "";
  return String(Number.parseFloat(value.toPrecision(12)));
}
