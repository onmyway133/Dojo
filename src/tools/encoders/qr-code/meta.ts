import { QrCode } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "qr-code",
  name: "QR Code",
  description: "Generate QR codes and read them from images",
  category: "encoders",
  icon: QrCode,
  keywords: ["qr", "barcode", "scan", "generate"],
});
