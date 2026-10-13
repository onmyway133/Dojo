import { all, create } from "mathjs";

const math = create(all);

export interface CalcLine {
  input: string;
  result?: string;
  error?: string;
}

/**
 * Evaluates each line in order with shared variables, like a notepad calculator.
 * Blank lines and lines starting with # or // are kept as is.
 */
export function evaluateLines(text: string): CalcLine[] {
  const parser = math.parser();
  return text.split("\n").map((input) => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) return { input };
    try {
      const value = parser.evaluate(trimmed);
      if (value === undefined || typeof value === "function") return { input };
      return { input, result: math.format(value, { precision: 14 }) };
    } catch (error) {
      return { input, error: (error as Error).message };
    }
  });
}
