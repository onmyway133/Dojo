import { HardDrive } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "data-size",
  name: "Data Size",
  description: "Convert bytes between KB, MB, GB and KiB, MiB, GiB",
  category: "converters",
  icon: HardDrive,
  keywords: ["bytes", "kilobyte", "megabyte", "gigabyte", "mebibyte", "storage", "bits"],
});
