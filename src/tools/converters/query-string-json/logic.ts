export type Direction = "query-to-json" | "json-to-query";

/** Accepts a bare query, `?a=1`, or a full URL. Repeated keys become arrays. */
export function queryToJson(input: string): string {
  const text = input.trim();
  let query = text;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) query = new URL(text).search;
  else if (text.includes("?")) query = text.slice(text.indexOf("?") + 1);
  query = query.replace(/^\?/, "").split("#")[0];

  const result: Record<string, string | string[]> = {};
  for (const [key, value] of new URLSearchParams(query)) {
    const existing = result[key];
    if (existing === undefined) result[key] = value;
    else result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return `${JSON.stringify(result, null, 2)}\n`;
}

/** A flat JSON object to a query string. Arrays repeat the key; objects are sent as JSON text. */
export function jsonToQuery(input: string): string {
  const value: unknown = JSON.parse(input);
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Expected a JSON object");
  const params = new URLSearchParams();
  const text = (v: unknown) => (typeof v === "object" && v !== null ? JSON.stringify(v) : String(v));
  for (const [key, v] of Object.entries(value)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((item) => params.append(key, text(item)));
    else params.append(key, v === null ? "" : text(v));
  }
  return params.toString();
}
