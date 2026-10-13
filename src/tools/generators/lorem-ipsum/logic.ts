import { secureIndex, secureInt } from "@/tools/shared/random";

const words =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

export type LoremUnit = "words" | "sentences" | "paragraphs";

const pick = () => words[secureIndex(words.length)];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function sentence(): string {
  const length = secureInt(6, 14);
  const parts = Array.from({ length }, pick);
  if (length > 9) parts[secureInt(3, length - 4)] += ",";
  return `${capitalize(parts.join(" "))}.`;
}

function paragraph(): string {
  return Array.from({ length: secureInt(4, 7) }, sentence).join(" ");
}

/** Placeholder text. `classic` starts with the familiar "Lorem ipsum dolor sit amet". */
export function lorem(unit: LoremUnit, count: number, classic: boolean): string {
  let text: string;
  if (unit === "words") text = Array.from({ length: count }, pick).join(" ");
  else if (unit === "sentences") text = Array.from({ length: count }, sentence).join(" ");
  else text = Array.from({ length: count }, paragraph).join("\n\n");

  if (!classic) return text;
  const opening = "Lorem ipsum dolor sit amet";
  if (unit === "words") {
    return opening.split(" ").concat(text.split(" ")).slice(0, count).join(" ");
  }
  return `${opening}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}
