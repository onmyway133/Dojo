export interface ParsedCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  partitioned?: boolean;
  priority?: string;
}

export type CookieSource = "cookie-header" | "set-cookie";

export interface CookieParseResult {
  source: CookieSource;
  cookies: ParsedCookie[];
}

const setCookieAttributes = /;\s*(expires|max-age|domain|path|secure|httponly|samesite|partitioned|priority)\b/i;

function splitPair(pair: string): [string, string] {
  const index = pair.indexOf("=");
  return index < 0 ? [pair.trim(), ""] : [pair.slice(0, index).trim(), pair.slice(index + 1).trim()];
}

const unquote = (value: string) => (value.length >= 2 && value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value);

/** One Set-Cookie value: `name=value; Attr=x; Flag`. */
export function parseSetCookie(line: string): ParsedCookie {
  const [first, ...attributes] = line.replace(/^set-cookie:\s*/i, "").split(";");
  const [name, value] = splitPair(first);
  if (!name) throw new Error(`Missing cookie name in “${line.trim()}”`);
  const cookie: ParsedCookie = { name, value: unquote(value) };
  for (const attribute of attributes) {
    const [key, raw] = splitPair(attribute);
    switch (key.toLowerCase()) {
      case "domain": cookie.domain = raw; break;
      case "path": cookie.path = raw; break;
      case "expires": {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) cookie.expires = date;
        break;
      }
      case "max-age": cookie.maxAge = Number(raw); break;
      case "secure": cookie.secure = true; break;
      case "httponly": cookie.httpOnly = true; break;
      case "samesite": cookie.sameSite = raw; break;
      case "partitioned": cookie.partitioned = true; break;
      case "priority": cookie.priority = raw; break;
    }
  }
  return cookie;
}

/** A Cookie request header: `a=1; b=2`. */
export function parseCookieHeader(header: string): ParsedCookie[] {
  return header
    .replace(/^cookie:\s*/i, "")
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [name, value] = splitPair(pair);
      return { name, value: unquote(value) };
    });
}

/**
 * Detects the format: lines starting with `Set-Cookie:` or carrying cookie attributes
 * are Set-Cookie values (one per line); anything else is a Cookie header.
 */
export function parseCookies(input: string): CookieParseResult {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const isSetCookie = lines.some((l) => /^set-cookie:/i.test(l) || setCookieAttributes.test(l));
  if (isSetCookie) return { source: "set-cookie", cookies: lines.map(parseSetCookie) };
  return { source: "cookie-header", cookies: lines.flatMap(parseCookieHeader) };
}

export function decodeValue(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

/** When the cookie stops being sent: Max-Age wins over Expires, as in browsers. */
export function expiryOf(cookie: ParsedCookie, now = Date.now()): Date | "session" {
  if (cookie.maxAge !== undefined && Number.isFinite(cookie.maxAge)) return new Date(now + cookie.maxAge * 1000);
  return cookie.expires ?? "session";
}
