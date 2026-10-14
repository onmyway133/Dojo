export type ExtractKind = "emails" | "urls" | "ipv4" | "ipv6" | "numbers" | "hexColors" | "hashtags" | "mentions";

const octet = "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";

const patterns: Record<ExtractKind, RegExp> = {
  emails: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
  urls: /\b(?:https?|ftp):\/\/[^\s<>"'`]+/gi,
  ipv4: new RegExp(`(?<![\\d.])(?:${octet}\\.){3}${octet}(?![\\d.]*\\d)`, "g"),
  // Candidates only; each one is checked by the URL parser below.
  ipv6: /(?<![\w:])(?:[0-9a-f]{0,4}:){2,7}(?:[0-9a-f]{1,4}|:|(?:\d{1,3}\.){3}\d{1,3})?(?![\w:])/gi,
  numbers: /(?<![\w.])-?\d+(?:\.\d+)?(?:e[+-]?\d+)?(?![\w])/gi,
  hexColors: /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w])/gi,
  hashtags: /(?<![\w#&])#[\p{L}\p{N}_]*\p{L}[\p{L}\p{N}_]*/gu,
  mentions: /(?<![\w@])@[A-Za-z0-9_]{1,30}(?![\w@.]*@)/g,
};

/** Drops trailing sentence punctuation, and a closing bracket that has no opening one in the URL. */
function trimUrl(url: string): string {
  let out = url.replace(/[.,;:!?'"]+$/, "");
  for (const [open, close] of [["(", ")"], ["[", "]"]]) {
    while (out.endsWith(close) && out.split(open).length < out.split(close).length) {
      out = out.slice(0, -1).replace(/[.,;:!?'"]+$/, "");
    }
  }
  return out;
}

function isIpv6(candidate: string): boolean {
  if (candidate.split(":").length < 3) return false;
  try {
    new URL(`http://[${candidate}]/`);
    return true;
  } catch {
    return false;
  }
}

export interface ExtractOptions {
  unique: boolean;
  sort: boolean;
}

export function extract(text: string, kind: ExtractKind, { unique, sort }: ExtractOptions): string[] {
  let found = [...text.matchAll(patterns[kind])].map((m) => m[0]);
  if (kind === "urls") found = found.map(trimUrl);
  if (kind === "ipv6") found = found.filter(isIpv6);
  // #fff and #0a84ff are colors, not tags.
  if (kind === "hashtags") found = found.filter((tag) => !/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(tag));
  if (unique) found = [...new Set(found)];
  if (sort) {
    found =
      kind === "numbers"
        ? found.sort((a, b) => Number(a) - Number(b))
        : found.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }
  return found;
}
