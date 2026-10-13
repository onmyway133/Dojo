const digits = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Parses an integer of any size in base 2–36. Ignores spaces, `_`, `,` and 0x/0b/0o prefixes. */
export function parseBigInt(text: string, base: number): bigint {
  let clean = text.trim().toLowerCase().replace(/[\s_,]/g, "");
  const negative = clean.startsWith("-");
  if (negative) clean = clean.slice(1);
  const prefix = { 16: "0x", 2: "0b", 8: "0o" }[base];
  if (prefix && clean.startsWith(prefix)) clean = clean.slice(2);
  if (!clean) throw new Error("Enter a number");

  const big = BigInt(base);
  let value = 0n;
  for (const char of clean) {
    const digit = digits.indexOf(char);
    if (digit < 0 || digit >= base) throw new Error(`“${char}” is not a base ${base} digit`);
    value = value * big + BigInt(digit);
  }
  return negative ? -value : value;
}

export function formatBigInt(value: bigint, base: number, group = false): string {
  const negative = value < 0n;
  const raw = (negative ? -value : value).toString(base);
  const text = group ? groupDigits(raw, base) : raw;
  return negative ? `-${text}` : text;
}

/** Groups from the right: 4 for binary and hex, 3 otherwise. */
function groupDigits(text: string, base: number): string {
  const size = base === 2 || base === 16 ? 4 : 3;
  const separator = base === 10 ? "," : " ";
  const parts: string[] = [];
  for (let end = text.length; end > 0; end -= size) parts.unshift(text.slice(Math.max(0, end - size), end));
  return parts.join(separator);
}
