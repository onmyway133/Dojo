import { call } from "@/lib/invoke";

export type Direction = "plist-to-json" | "json-to-plist";

export const plistToJson = (text: string) => call<string>("plist_to_json", { text });
export const jsonToPlist = (json: string) => call<string>("json_to_plist", { json });
/** Binary or XML plist bytes, as base64, to XML text. */
export const plistFileToXml = (base64: string) => call<string>("plist_file_to_xml", { base64 });
