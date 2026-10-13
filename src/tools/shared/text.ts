const units = ["B", "KB", "MB", "GB"];

/** "1.4 KB" style size of a string encoded as UTF-8. */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${units[unit]}`;
}

export const byteLength = (text: string) => new TextEncoder().encode(text).length;

export function lineCount(text: string): number {
  if (!text) return 0;
  let count = 1;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) count++;
  return count;
}

/** "12 lines · 1.4 KB", for section headers. */
export function describeText(text: string): string {
  if (!text) return "";
  const lines = lineCount(text);
  return `${lines} ${lines === 1 ? "line" : "lines"} · ${formatBytes(byteLength(text))}`;
}

/** 1-based line and column of a character offset. */
export function positionAt(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset);
  const line = lineCount(before) || 1;
  const column = offset - before.lastIndexOf("\n");
  return { line, column };
}
