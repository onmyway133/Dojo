import { secureIndex, secureShuffle } from "@/tools/shared/random";

export interface PasswordOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  /** Drop look-alikes such as I, l, 1, O and 0. */
  avoidAmbiguous: boolean;
}

const sets = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~",
};
const ambiguous = /[Il1O0o|`'"]/g;

function activeSets(options: PasswordOptions): string[] {
  return (Object.keys(sets) as (keyof typeof sets)[])
    .filter((key) => options[key])
    .map((key) => (options.avoidAmbiguous ? sets[key].replace(ambiguous, "") : sets[key]));
}

/** Guarantees at least one character from every enabled set. */
export function generatePassword(options: PasswordOptions): string {
  const groups = activeSets(options);
  if (groups.length === 0) throw new Error("Choose at least one character set");
  const pool = groups.join("");
  const chars = groups.map((g) => g[secureIndex(g.length)]);
  while (chars.length < options.length) chars.push(pool[secureIndex(pool.length)]);
  return secureShuffle(chars).slice(0, options.length).join("");
}

/** Bits of entropy for a uniformly random password over the enabled pool. */
export function entropyBits(options: PasswordOptions): number {
  const pool = activeSets(options).join("").length;
  return pool === 0 ? 0 : options.length * Math.log2(pool);
}
