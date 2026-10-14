const numerals: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function toRoman(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    throw new Error("Roman numerals cover whole numbers from 1 to 3999");
  }
  let rest = value;
  let out = "";
  for (const [n, symbol] of numerals) {
    while (rest >= n) {
      out += symbol;
      rest -= n;
    }
  }
  return out;
}

/** Parses a numeral and rejects non-canonical forms such as IIII or VX. */
export function fromRoman(text: string): number {
  const roman = text.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(roman)) throw new Error("Use only the letters M D C L X V I");
  let total = 0;
  let i = 0;
  for (const [n, symbol] of numerals) {
    while (roman.startsWith(symbol, i)) {
      total += n;
      i += symbol.length;
    }
  }
  if (i !== roman.length || toRoman(total) !== roman) throw new Error(`"${roman}" isn't a valid Roman numeral`);
  return total;
}
