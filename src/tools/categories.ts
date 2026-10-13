import {
  ArrowLeftRight,
  Braces,
  FlaskConical,
  Image,
  Sparkles,
  Type,
  Binary,
  Wrench,
} from "lucide-react";
import type { Category } from "./types";

/** Categories in display order. */
export const categories: Category[] = [
  { id: "formatters", name: "Formatters", icon: Braces },
  { id: "converters", name: "Converters", icon: ArrowLeftRight },
  { id: "encoders", name: "Encoders & Decoders", icon: Binary },
  { id: "generators", name: "Generators", icon: Sparkles },
  { id: "text", name: "Text", icon: Type },
  { id: "testers", name: "Testers", icon: FlaskConical },
  { id: "graphics", name: "Graphics", icon: Image },
  { id: "utilities", name: "Utilities", icon: Wrench },
];
