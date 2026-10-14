import { Ruler } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "unit",
  name: "Unit Converter",
  description: "Length, mass, temperature, volume, speed, data and more",
  category: "converters",
  icon: Ruler,
  keywords: ["units", "measure", "metric", "imperial", "celsius", "fahrenheit", "miles", "km", "pounds", "kg", "liters", "gallons"],
});
