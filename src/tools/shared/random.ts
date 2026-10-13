/** Uniform integer in [0, bound) from the system CSPRNG, without modulo bias. */
export function secureIndex(bound: number): number {
  if (bound <= 0 || bound > 2 ** 32) throw new Error("bound out of range");
  const limit = Math.floor(2 ** 32 / bound) * bound;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % bound;
}

/** Uniform integer in [min, max], inclusive. */
export function secureInt(min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) throw new Error("Invalid range");
  const span = max - min + 1;
  if (span > 2 ** 32) {
    // Two draws for wide ranges.
    const high = secureIndex(Math.ceil(span / 2 ** 32));
    return min + ((high * 2 ** 32 + secureIndex(2 ** 32)) % span);
  }
  return min + secureIndex(span);
}

export function secureString(length: number, alphabet: string): string {
  const chars = [...alphabet];
  if (chars.length === 0) throw new Error("Choose at least one character set");
  let out = "";
  for (let i = 0; i < length; i++) out += chars[secureIndex(chars.length)];
  return out;
}

/** Fisher–Yates with the secure generator. */
export function secureShuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
