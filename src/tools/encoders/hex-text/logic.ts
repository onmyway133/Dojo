export type Separator = "space" | "none" | "colon" | "0x";

const join: Record<Separator, (bytes: string[]) => string> = {
  space: (b) => b.join(" "),
  none: (b) => b.join(""),
  colon: (b) => b.join(":"),
  "0x": (b) => b.map((x) => `0x${x}`).join(", "),
};

export function textToHex(text: string, separator: Separator, uppercase: boolean): string {
  const bytes = [...new TextEncoder().encode(text)].map((b) => b.toString(16).padStart(2, "0"));
  const out = join[separator](bytes);
  return uppercase ? out.toUpperCase().replace(/0X/g, "0x") : out;
}

/** Accepts any mix of spaces, colons, commas and 0x prefixes. */
export function hexToText(hex: string): string {
  const clean = hex.replace(/0x/gi, "").replace(/[\s:,]/g, "");
  if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error("Contains characters that aren't hex digits");
  if (clean.length % 2 !== 0) throw new Error("Hex needs an even number of digits");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return new TextDecoder().decode(bytes);
}
