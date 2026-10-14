export type SlugSeparator = "-" | "_" | ".";

/** URL slug: diacritics stripped, anything that isn't a letter or digit becomes one separator. */
export function slugify(text: string, separator: SlugSeparator, lowercase: boolean): string {
  const plain = text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .replace(/&/g, " and ");
  const slug = plain
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .join(separator);
  return lowercase ? slug.toLowerCase() : slug;
}

/** One slug per input line, keeping empty lines so output lines up with input. */
export function slugifyLines(text: string, separator: SlugSeparator, lowercase: boolean): string {
  return text
    .split("\n")
    .map((line) => slugify(line, separator, lowercase))
    .join("\n");
}
