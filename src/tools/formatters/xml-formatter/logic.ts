import formatXml from "xml-formatter";
import { indentString, type Indent } from "@/tools/shared/indent";

export type XmlStyle = Indent | "minify";

export function formatXmlText(input: string, style: XmlStyle): string {
  const options = { collapseContent: true, throwOnFailure: true };
  if (style === "minify") return formatXml.minify(input, options);
  return formatXml(input, { ...options, indentation: indentString(style), lineSeparator: "\n" });
}

export const sampleXml = `<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>CFBundleName</key><string>DevTools</string><key>LSMinimumSystemVersion</key><string>13.0</string><key>Features</key><array><string>Formatters</string><string>Converters</string></array></dict></plist>`;
