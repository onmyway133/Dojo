export interface CodePointInfo {
  char: string;
  codePoint: number;
  /** "U+1F44B" */
  label: string;
  utf8: string;
  utf16: string;
  js: string;
  html: string;
}

const hex = (n: number, pad = 4) => n.toString(16).toUpperCase().padStart(pad, "0");

export function inspect(text: string): CodePointInfo[] {
  return [...text].map((char) => {
    const codePoint = char.codePointAt(0)!;
    const utf8 = [...new TextEncoder().encode(char)].map((b) => hex(b, 2)).join(" ");
    const utf16 = Array.from({ length: char.length }, (_, i) => hex(char.charCodeAt(i))).join(" ");
    return {
      char,
      codePoint,
      label: `U+${hex(codePoint)}`,
      utf8,
      utf16,
      js: codePoint > 0xffff ? `\\u{${hex(codePoint)}}` : `\\u${hex(codePoint)}`,
      html: `&#x${hex(codePoint, 1)};`,
    };
  });
}

/**
 * Reads code points written as U+1F44B, \u{1F44B}, 👋, &#x1F44B;, &#128075;, 0x41
 * or bare hex, separated by spaces, commas or nothing.
 */
export function fromCodePoints(input: string): string {
  const pattern = /U\+([0-9A-F]{1,6})|\\u\{([0-9A-F]{1,6})\}|\\u([0-9A-F]{4})|&#x([0-9A-F]{1,6});|&#(\d{1,7});|0x([0-9A-F]{1,6})|([0-9A-F]{2,6})/gi;
  const units: number[] = [];
  let consumed = "";
  for (const m of input.matchAll(pattern)) {
    consumed += m[0];
    const value = m[1] ?? m[2] ?? m[4] ?? m[6] ?? m[7];
    if (m[3]) units.push(-parseInt(m[3], 16)); // UTF-16 unit, paired below
    else if (m[5]) units.push(Number(m[5]));
    else units.push(parseInt(value!, 16));
  }
  const leftovers = input.replace(pattern, "").replace(/[\s,;]+/g, "");
  if (leftovers) throw new Error(`Couldn't read “${leftovers.slice(0, 20)}”`);
  if (!consumed) return "";
  let out = "";
  for (let i = 0; i < units.length; i++) {
    const n = units[i];
    if (n < 0) {
      out += String.fromCharCode(-n);
      continue;
    }
    if (n > 0x10ffff) throw new Error(`U+${hex(n)} is beyond Unicode`);
    out += String.fromCodePoint(n);
  }
  return out;
}
