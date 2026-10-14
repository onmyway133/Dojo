/** UTF-8 bytes as space separated 8-bit groups. */
export function textToBinary(text: string): string {
  return [...new TextEncoder().encode(text)].map((b) => b.toString(2).padStart(8, "0")).join(" ");
}

/** Accepts groups separated by any whitespace, or one unbroken run of bits. */
export function binaryToText(binary: string): string {
  const clean = binary.replace(/\s+/g, "");
  if (!/^[01]*$/.test(clean)) throw new Error("Use only 0 and 1");
  if (clean.length % 8 !== 0) throw new Error(`Bits come in groups of 8; got ${clean.length} bits`);
  const bytes = new Uint8Array(clean.length / 8);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 8, i * 8 + 8), 2);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
