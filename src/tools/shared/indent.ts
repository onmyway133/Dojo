import type { Choice } from "@/components/tool";

export type Indent = "2" | "4" | "tab";

export const indentChoices: Choice<Indent>[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

export const indentString = (indent: Indent) => (indent === "tab" ? "\t" : " ".repeat(Number(indent)));
