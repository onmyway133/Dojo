import { secureString } from "@/tools/shared/random";

export const alphabets = {
  default: "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",
  alphanumeric: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  lowercase: "0123456789abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  nolookalikes: "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz",
} as const;
export type AlphabetId = keyof typeof alphabets;

export function nanoid(size: number, alphabet: string): string {
  if (alphabet.length < 2) throw new Error("The alphabet needs at least 2 characters");
  return secureString(size, alphabet);
}

/** Expected number of IDs before a 1% chance of one collision (birthday bound). */
export function idsForOnePercentCollision(size: number, alphabetLength: number): number {
  const space = Math.pow(alphabetLength, size);
  return Math.sqrt(2 * space * Math.log(1 / (1 - 0.01)));
}
