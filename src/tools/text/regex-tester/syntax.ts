/** Where clicking a token puts it: into the pattern, the flags, or the replacement. */
export type CheatTarget = "pattern" | "flags" | "replacement";

export interface CheatToken {
  token: string;
  description: string;
}

export interface CheatGroup {
  name: string;
  target: CheatTarget;
  tokens: CheatToken[];
}

/** JavaScript (ECMAScript) regular expression syntax. */
export const cheatsheet: CheatGroup[] = [
  {
    name: "Character classes",
    target: "pattern",
    tokens: [
      { token: ".", description: "Any character except line breaks (any at all with the s flag)" },
      { token: "\\d", description: "Digit 0-9" },
      { token: "\\D", description: "Not a digit" },
      { token: "\\w", description: "Word character: A-Z, a-z, 0-9, _" },
      { token: "\\W", description: "Not a word character" },
      { token: "\\s", description: "Whitespace: space, tab, line breaks" },
      { token: "\\S", description: "Not whitespace" },
      { token: "[abc]", description: "Any one of a, b or c" },
      { token: "[^abc]", description: "Any character except a, b or c" },
      { token: "[a-z]", description: "Any character in the range a to z" },
      { token: "\\p{L}", description: "Unicode letter (needs the u or v flag)" },
      { token: "\\P{L}", description: "Not a Unicode letter (needs the u or v flag)" },
    ],
  },
  {
    name: "Anchors",
    target: "pattern",
    tokens: [
      { token: "^", description: "Start of the string, or of a line with the m flag" },
      { token: "$", description: "End of the string, or of a line with the m flag" },
      { token: "\\b", description: "Word boundary" },
      { token: "\\B", description: "Not a word boundary" },
    ],
  },
  {
    name: "Quantifiers",
    target: "pattern",
    tokens: [
      { token: "*", description: "0 or more" },
      { token: "+", description: "1 or more" },
      { token: "?", description: "0 or 1 (optional)" },
      { token: "{3}", description: "Exactly 3" },
      { token: "{3,}", description: "3 or more" },
      { token: "{3,5}", description: "Between 3 and 5" },
      { token: "*?", description: "0 or more, as few as possible (lazy)" },
      { token: "+?", description: "1 or more, as few as possible (lazy)" },
    ],
  },
  {
    name: "Groups and references",
    target: "pattern",
    tokens: [
      { token: "(abc)", description: "Capture group" },
      { token: "(?<name>abc)", description: "Named capture group" },
      { token: "(?:abc)", description: "Group without capturing" },
      { token: "a|b", description: "a or b" },
      { token: "\\1", description: "Same text as group 1 matched" },
      { token: "\\k<name>", description: "Same text as the named group matched" },
    ],
  },
  {
    name: "Lookarounds",
    target: "pattern",
    tokens: [
      { token: "(?=abc)", description: "Followed by abc" },
      { token: "(?!abc)", description: "Not followed by abc" },
      { token: "(?<=abc)", description: "Preceded by abc" },
      { token: "(?<!abc)", description: "Not preceded by abc" },
    ],
  },
  {
    name: "Escapes",
    target: "pattern",
    tokens: [
      { token: "\\.", description: "A literal dot. Escape any of . ^ $ * + ? ( ) [ ] { } | \\ / the same way" },
      { token: "\\t", description: "Tab" },
      { token: "\\n", description: "Line feed" },
      { token: "\\r", description: "Carriage return" },
      { token: "\\x41", description: "Character by 2-digit hex code (A)" },
      { token: "\\u00e9", description: "Character by 4-digit hex code (é)" },
      { token: "\\u{1F600}", description: "Code point, needs the u or v flag (😀)" },
    ],
  },
  {
    name: "Flags",
    target: "flags",
    tokens: [
      { token: "g", description: "Global: find every match, not just the first" },
      { token: "i", description: "Ignore case" },
      { token: "m", description: "Multiline: ^ and $ match at line breaks" },
      { token: "s", description: "Dot all: . also matches line breaks" },
      { token: "u", description: "Unicode: code points, \\p{…} and \\u{…}" },
      { token: "y", description: "Sticky: match only at lastIndex" },
    ],
  },
  {
    name: "Replacement",
    target: "replacement",
    tokens: [
      { token: "$&", description: "The whole match" },
      { token: "$1", description: "Capture group 1" },
      { token: "$<name>", description: "Named capture group" },
      { token: "$`", description: "Text before the match" },
      { token: "$'", description: "Text after the match" },
      { token: "$$", description: "A literal $" },
    ],
  },
];

export function filterCheatsheet(groups: CheatGroup[], query: string): CheatGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({
      ...g,
      tokens: g.name.toLowerCase().includes(q)
        ? g.tokens
        : g.tokens.filter((t) => t.token.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
    }))
    .filter((g) => g.tokens.length > 0);
}

/** Puts `token` over the selection [start, end) and returns the new text and caret. */
export function insertAt(text: string, token: string, start: number, end: number): { text: string; caret: number } {
  const from = Math.max(0, Math.min(start, text.length));
  const to = Math.max(from, Math.min(end, text.length));
  return { text: text.slice(0, from) + token + text.slice(to), caret: from + token.length };
}
