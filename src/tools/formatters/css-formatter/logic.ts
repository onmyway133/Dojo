/**
 * Small, safe CSS minifier: drops comments and collapses whitespace around
 * punctuation while leaving strings untouched.
 */
export function minifyCss(css: string): string {
  const parts = css.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part; // a quoted string
      return part
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,>~+])\s*/g, "$1")
        .replace(/;}/g, "}");
    })
    .join("")
    .trim();
}
