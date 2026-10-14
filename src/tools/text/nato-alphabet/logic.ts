// ICAO radiotelephony spelling alphabet; "Alfa" and "Juliett" are the official spellings.
const letters: Record<string, string> = {
  A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot", G: "Golf",
  H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima", M: "Mike", N: "November",
  O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango", U: "Uniform",
  V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee", Z: "Zulu",
  "0": "Zero", "1": "One", "2": "Two", "3": "Three", "4": "Four", "5": "Five",
  "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine",
};

/** One code word per character, words separated by " / ", other characters kept as is. */
export function toNato(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => [...word].map((c) => letters[c.toUpperCase()] ?? c).join(" "))
        .join(" / "),
    )
    .join("\n");
}

const reverse = new Map(Object.entries(letters).map(([k, v]) => [v.toLowerCase(), k]));
reverse.set("alpha", "A");
reverse.set("juliet", "J");
reverse.set("xray", "X");

/** Reads code words back into text; "/" separates words. */
export function fromNato(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .split("/")
        .map((word) =>
          word
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => reverse.get(w.toLowerCase()) ?? w)
            .join(""),
        )
        .join(" "),
    )
    .join("\n");
}
