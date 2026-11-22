import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { FileUp } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { type Choice, Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { Button } from "@/components/ui/button";
import { bytesToBase64 } from "@/lib/files";
import { type Direction, jsonToPlist, plistFileToXml, plistToJson } from "./api";

const jsonLanguage = json();
const xmlLanguage = xml();

const directionChoices: Choice<Direction>[] = [
  { value: "plist-to-json", label: "Plist → JSON" },
  { value: "json-to-plist", label: "JSON → Plist" },
];

const samplePlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleIdentifier</key>
	<string>com.example.sample</string>
	<key>CFBundleShortVersionString</key>
	<string>1.2.0</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>arm64</string>
	</array>
</dict>
</plist>
`;

const sampleJson = `{
  "CFBundleIdentifier": "com.example.sample",
  "CFBundleShortVersionString": "1.2.0",
  "LSRequiresIPhoneOS": true,
  "UIRequiredDeviceCapabilities": ["arm64"]
}
`;

export default function PlistJsonTool() {
  const [direction, setDirection] = usePersistentState<Direction>("direction", "plist-to-json");
  // Shared with TransformTool's input so an opened file lands in the editor.
  const [, setInput] = usePersistentState("input", "");
  const toJson = direction === "plist-to-json";
  const transform = useCallback((input: string) => (toJson ? plistToJson(input) : jsonToPlist(input)), [toJson]);

  function openFile() {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = ".plist,.entitlements,.strings,.xml";
    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (!file) return;
      try {
        setInput(await plistFileToXml(bytesToBase64(new Uint8Array(await file.arrayBuffer()))));
        setDirection("plist-to-json");
      } catch (error) {
        toast.error("Couldn't read the property list", { description: String(error) });
      }
    };
    picker.click();
  }

  return (
    <TransformTool
      transform={transform}
      inputTitle={toJson ? "Plist" : "JSON"}
      outputTitle={toJson ? "JSON" : "Plist"}
      inputLanguage={toJson ? xmlLanguage : jsonLanguage}
      outputLanguage={toJson ? jsonLanguage : xmlLanguage}
      sample={toJson ? samplePlist : sampleJson}
      placeholder={toJson ? "Paste an XML plist, or open a binary or XML .plist file" : "Paste JSON"}
      options={
        <ToolOptions>
          <Option label="Convert">
            <Segmented value={direction} onChange={setDirection} choices={directionChoices} />
          </Option>
          <Button variant="toolbar" size="sm" onClick={openFile}>
            <FileUp />
            Open Plist File
          </Button>
        </ToolOptions>
      }
    />
  );
}
