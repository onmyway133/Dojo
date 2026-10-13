/**
 * Splits text into words across separators and case changes, keeping acronyms
 * together: "parseHTTPResponse_v2" -> ["parse", "HTTP", "Response", "v2"].
 */
export function splitWords(text: string): string[] {
  return (
    text
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

const minorWords = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "vs", "via"]);

export interface CaseStyle {
  id: string;
  name: string;
  convert: (text: string) => string;
}

const words = (text: string) => splitWords(text).map((w) => w.toLowerCase());

/** Converters that work per line, so a list of identifiers converts in one go. */
export const caseStyles: CaseStyle[] = [
  { id: "camel", name: "camelCase", convert: (t) => words(t).map((w, i) => (i === 0 ? w : capitalize(w))).join("") },
  { id: "pascal", name: "PascalCase", convert: (t) => words(t).map(capitalize).join("") },
  { id: "snake", name: "snake_case", convert: (t) => words(t).join("_") },
  { id: "constant", name: "CONSTANT_CASE", convert: (t) => words(t).join("_").toUpperCase() },
  { id: "kebab", name: "kebab-case", convert: (t) => words(t).join("-") },
  { id: "train", name: "Train-Case", convert: (t) => words(t).map(capitalize).join("-") },
  { id: "dot", name: "dot.case", convert: (t) => words(t).join(".") },
  { id: "path", name: "path/case", convert: (t) => words(t).join("/") },
  {
    id: "title",
    name: "Title Case",
    convert: (t) =>
      words(t)
        .map((w, i, all) => (i > 0 && i < all.length - 1 && minorWords.has(w) ? w : capitalize(w)))
        .join(" "),
  },
  {
    id: "sentence",
    name: "Sentence case",
    convert: (t) => {
      const sentence = words(t).join(" ");
      return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    },
  },
  { id: "lower", name: "lower case", convert: (t) => t.toLowerCase() },
  { id: "upper", name: "UPPER CASE", convert: (t) => t.toUpperCase() },
];

export function convertLines(text: string, style: CaseStyle): string {
  return text
    .split("\n")
    .map((line) => style.convert(line))
    .join("\n");
}
