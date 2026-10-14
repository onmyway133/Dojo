export interface StrengthReport {
  length: number;
  /** Size of the character pool the password appears to draw from. */
  pool: number;
  classes: string[];
  /** Bits after penalties for patterns; an estimate, not a guarantee. */
  bits: number;
  warnings: string[];
}

// A handful of the most common passwords from public breach lists; enough to flag the obvious.
const common = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111", "1234567",
  "dragon", "123123", "baseball", "abc123", "football", "monkey", "letmein", "696969", "shadow",
  "master", "666666", "qwertyuiop", "123321", "mustang", "1234567890", "michael", "654321",
  "superman", "1qaz2wsx", "7777777", "121212", "000000", "qazwsx", "123qwe", "killer", "trustno1",
  "jordan", "jennifer", "zxcvbnm", "asdfgh", "hunter", "buster", "soccer", "harley", "batman",
  "andrew", "tigger", "sunshine", "iloveyou", "2000", "charlie", "robert", "thomas", "hockey",
  "ranger", "daniel", "starwars", "klaster", "112233", "george", "computer", "michelle", "jessica",
  "pepper", "1111", "zxcvbn", "555555", "11111111", "131313", "freedom", "777777", "pass", "maggie",
  "159753", "aaaaaa", "ginger", "princess", "joshua", "cheese", "amanda", "summer", "love", "ashley",
  "nicole", "chelsea", "biteme", "matthew", "access", "yankees", "987654321", "dallas", "austin",
  "thunder", "taylor", "matrix", "admin", "welcome", "password1", "qwerty123", "passw0rd", "p@ssw0rd",
]);

const sequences = ["abcdefghijklmnopqrstuvwxyz", "01234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function hasSequence(lower: string, run = 4): boolean {
  for (const seq of sequences) {
    const both = [seq, [...seq].reverse().join("")];
    for (const s of both) {
      for (let i = 0; i + run <= s.length; i++) if (lower.includes(s.slice(i, i + run))) return true;
    }
  }
  return false;
}

export function analyzePassword(password: string): StrengthReport {
  const chars = [...password];
  const classes: string[] = [];
  let pool = 0;
  if (/[a-z]/.test(password)) (pool += 26), classes.push("Lowercase");
  if (/[A-Z]/.test(password)) (pool += 26), classes.push("Uppercase");
  if (/[0-9]/.test(password)) (pool += 10), classes.push("Digits");
  if (/[ -/:-@[-`{-~]/.test(password)) (pool += 33), classes.push("Symbols");
  // Assumption: anything outside ASCII adds a modest pool rather than the whole of Unicode.
  if (/[^\x00-\x7f]/.test(password)) (pool += 100), classes.push("Other characters");

  const perChar = pool > 0 ? Math.log2(pool) : 0;
  let bits = chars.length * perChar;
  const warnings: string[] = [];
  const lower = password.toLowerCase();
  // Undo common letter swaps (p@ssw0rd) before looking for dictionary words.
  const plain = lower.replace(/[@4]/g, "a").replace(/0/g, "o").replace(/[1!]/g, "i").replace(/3/g, "e").replace(/\$/g, "s");

  if (common.has(lower) || common.has(lower.replace(/[^a-z0-9@]/g, ""))) {
    warnings.push("It's one of the most common passwords");
    bits = Math.min(bits, 10);
  } else {
    // A known word costs an attacker about as much as picking one entry from a short list:
    // its characters are scored as one ~10 bit choice instead of random characters.
    const word = [...common]
      .filter((w) => w.length >= 4 && /[a-z]/.test(w) && plain.includes(w))
      .sort((a, b) => b.length - a.length)[0];
    if (word) {
      warnings.push(`Contains the common word "${word}"`);
      bits = Math.max(0, bits - word.length * perChar) + 10;
    }
  }
  const year = password.match(/(19|20)\d{2}/);
  if (year) {
    warnings.push(`Contains a year (${year[0]})`);
    bits = Math.max(0, bits - 4 * perChar) + 7;
  }
  if (/(.)\1{2,}/u.test(password)) {
    warnings.push("Repeats the same character three or more times");
    bits *= 0.8;
  }
  if (hasSequence(lower)) {
    warnings.push("Contains a keyboard or alphabet sequence");
    bits *= 0.8;
  }
  if (chars.length > 0 && chars.length < 12) warnings.push("Shorter than 12 characters");
  if (chars.length > 0 && classes.length === 1) warnings.push("Uses only one kind of character");

  return { length: chars.length, pool, classes, bits, warnings };
}

/** Average time to guess: half the search space at `guessesPerSecond`. */
export function crackSeconds(bits: number, guessesPerSecond: number): number {
  return Math.pow(2, bits - 1) / guessesPerSecond;
}

const units: [number, string][] = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [365.25, "day"],
  [1_000_000, "year"],
];

export function describeDuration(seconds: number): string {
  if (seconds < 1) return "Instantly";
  let value = seconds;
  for (const [size, name] of units) {
    if (value < size) {
      const rounded = Math.round(value);
      return `${rounded.toLocaleString("en-US")} ${name}${rounded === 1 ? "" : "s"}`;
    }
    value /= size;
  }
  return "More than a million years";
}
