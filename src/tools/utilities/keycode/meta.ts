import { Keyboard } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "keycode",
  name: "Key Code Inspector",
  description: "Press a key to see its key, code, keyCode and modifiers",
  category: "utilities",
  icon: Keyboard,
  keywords: ["keyboard", "keydown", "event", "keycode", "shortcut", "javascript"],
});
