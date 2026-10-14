import { Wifi } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "wifi-qr",
  name: "Wi-Fi QR Code",
  description: "Make a QR code that phones scan to join a Wi-Fi network",
  category: "generators",
  icon: Wifi,
  keywords: ["wifi", "wireless", "network", "ssid", "qr", "guest"],
});
