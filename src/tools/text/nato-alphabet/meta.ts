import { Radio } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "nato-alphabet",
  name: "NATO Alphabet",
  description: "Spell text with the phonetic alphabet, Alfa Bravo Charlie",
  category: "text",
  icon: Radio,
  keywords: ["phonetic", "icao", "spelling", "alpha bravo", "radio"],
});
