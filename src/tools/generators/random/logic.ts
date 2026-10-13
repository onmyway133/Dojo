import { secureInt, secureShuffle, secureString } from "@/tools/shared/random";

export function randomIntegers(min: number, max: number, count: number, unique: boolean): number[] {
  if (unique && max - min + 1 < count) throw new Error(`Only ${max - min + 1} unique numbers fit in that range`);
  if (!unique) return Array.from({ length: count }, () => secureInt(min, max));
  const seen = new Set<number>();
  while (seen.size < count) seen.add(secureInt(min, max));
  return [...seen];
}

export const charsets = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  hex: "0123456789abcdef",
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  base64url: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
};
export type Charset = keyof typeof charsets;

export const randomStrings = (length: number, charset: Charset, count: number) =>
  Array.from({ length: count }, () => secureString(length, charsets[charset]));

/** Shuffles non-empty lines. */
export const shuffleLines = (text: string) =>
  secureShuffle(text.split("\n").filter((l) => l.trim() !== "")).join("\n");
