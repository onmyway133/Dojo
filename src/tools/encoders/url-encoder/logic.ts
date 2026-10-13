export type UrlMode = "component" | "uri" | "decode";

export function transformUrl(input: string, mode: UrlMode, plusForSpace: boolean): string {
  if (mode === "decode") {
    const text = plusForSpace ? input.replace(/\+/g, " ") : input;
    try {
      return decodeURIComponent(text);
    } catch {
      throw new Error("Malformed percent-encoding");
    }
  }
  const encoded = mode === "component" ? encodeURIComponent(input) : encodeURI(input);
  return plusForSpace ? encoded.replace(/%20/g, "+") : encoded;
}
