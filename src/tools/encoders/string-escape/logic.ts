export type Quote = "double" | "single";

/** Escapes control characters, backslashes and the chosen quote, like a JSON/JS string literal body. */
export function escapeString(text: string, quote: Quote, escapeUnicode: boolean): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0)!;
    switch (char) {
      case "\\": out += "\\\\"; break;
      case "\n": out += "\\n"; break;
      case "\r": out += "\\r"; break;
      case "\t": out += "\\t"; break;
      case "\b": out += "\\b"; break;
      case "\f": out += "\\f"; break;
      case '"': out += quote === "double" ? '\\"' : char; break;
      case "'": out += quote === "single" ? "\\'" : char; break;
      default:
        if (code < 0x20 || (escapeUnicode && code > 0x7e)) out += unicodeEscape(code);
        else out += char;
    }
  }
  return out;
}

function unicodeEscape(code: number): string {
  if (code <= 0xffff) return `\\u${code.toString(16).padStart(4, "0")}`;
  // Astral characters as a surrogate pair, which JSON and every JS engine accept.
  const high = Math.floor((code - 0x10000) / 0x400) + 0xd800;
  const low = ((code - 0x10000) % 0x400) + 0xdc00;
  return `\\u${high.toString(16)}\\u${low.toString(16)}`;
}

const simple: Record<string, string> = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", 0: "\0", "\\": "\\", '"': '"', "'": "'", "/": "/" };

/** Resolves \n, \t, \xHH, \uXXXX, \u{X…} and surrogate pairs. Unknown escapes keep the character. */
export function unescapeString(text: string): string {
  return text.replace(/\\(u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|[\s\S])/g, (_, seq, brace, u4, x2) => {
    if (brace) return String.fromCodePoint(parseInt(brace, 16));
    if (u4) return String.fromCharCode(parseInt(u4, 16));
    if (x2) return String.fromCharCode(parseInt(x2, 16));
    return simple[seq] ?? seq;
  });
}
