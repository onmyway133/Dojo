/** Elements whose content must keep its exact whitespace. */
const preserved = /(<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\2>)/gi;

/**
 * Conservative HTML minifier: drops comments (keeping IE conditionals), collapses runs of
 * whitespace to one space and removes whitespace between tags. Content of pre, textarea,
 * script and style is left exactly as written.
 */
export function minifyHtml(html: string): string {
  const parts = html.split(preserved);
  return parts
    .map((part, index) => {
      // split() with two capture groups yields [text, block, tagName, text, ...]
      if (index % 3 === 1) return part;
      if (index % 3 === 2) return "";
      let text = part
        .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
        .replace(/\s+/g, " ")
        .replace(/>\s+</g, "><");
      // Preserved blocks start with "<" and end with ">", so whitespace next to them is between tags.
      if (index > 0 && index < parts.length - 1 && text.trim() === "") return "";
      if (index > 0) text = text.replace(/^\s+</, "<");
      if (index < parts.length - 1) text = text.replace(/>\s+$/, ">");
      return text;
    })
    .join("")
    .trim();
}
