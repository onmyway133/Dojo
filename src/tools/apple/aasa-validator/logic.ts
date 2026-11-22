// Rules from Apple's applinks reference (bundleresources/applinks): components are checked in
// order and the first match wins; a component matches when every part it lists matches;
// `*` is zero or more characters, `?` one character, `?*` one or more.

export interface Issue {
  level: "error" | "warning";
  message: string;
}

interface Options {
  caseSensitive: boolean;
  percentEncoded: boolean;
}

export interface Component {
  "/"?: string;
  "?"?: string | Record<string, string>;
  "#"?: string;
  exclude?: boolean;
  caseSensitive?: boolean;
  percentEncoded?: boolean;
  comment?: string;
}

export interface Detail {
  appIDs: string[];
  components?: Component[];
  paths?: string[];
  defaults: Options;
}

export interface Aasa {
  details: Detail[];
  variables: Record<string, string[]>;
  webcredentials: string[];
  appclips: string[];
}

export interface Analysis {
  aasa?: Aasa;
  issues: Issue[];
  size: number;
}

/** Apple's documented limit for iOS 9.3.1 and later (archived Universal Links guide). */
export const SIZE_LIMIT = 128 * 1024;
const APP_ID = /^[A-Z0-9]{10}\.[A-Za-z0-9.\-*]+$/;
const COMPONENT_KEYS = new Set(["/", "?", "#", "exclude", "caseSensitive", "percentEncoded", "comment"]);

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const stringArray = (v: unknown) => Array.isArray(v) && v.every((s) => typeof s === "string");

function readOptions(value: unknown, base: Options): Options {
  if (!isObject(value)) return base;
  return {
    caseSensitive: typeof value.caseSensitive === "boolean" ? value.caseSensitive : base.caseSensitive,
    percentEncoded: typeof value.percentEncoded === "boolean" ? value.percentEncoded : base.percentEncoded,
  };
}

export function analyze(text: string): Analysis {
  const size = new TextEncoder().encode(text).length;
  const issues: Issue[] = [];
  const error = (message: string) => issues.push({ level: "error", message });
  const warn = (message: string) => issues.push({ level: "warning", message });

  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch (e) {
    error(`Invalid JSON: ${(e as Error).message}`);
    return { issues, size };
  }
  if (size > SIZE_LIMIT) error(`File is ${size} bytes, over the 128 KB limit`);
  if (!isObject(root)) {
    error("The top level must be an object");
    return { issues, size };
  }

  const aasa: Aasa = { details: [], variables: {}, webcredentials: [], appclips: [] };
  const checkAppId = (id: string, where: string) => {
    if (!APP_ID.test(id)) warn(`${where}: "${id}" doesn't look like TEAMID.bundle.identifier`);
  };

  const applinks = root.applinks;
  if (applinks === undefined) {
    warn("No applinks section, so no universal links");
  } else if (!isObject(applinks)) {
    error("applinks must be an object");
  } else {
    const defaults = readOptions(applinks.defaults, { caseSensitive: true, percentEncoded: true });
    if (applinks.substitutionVariables !== undefined) {
      if (!isObject(applinks.substitutionVariables)) error("applinks.substitutionVariables must be an object");
      else
        for (const [name, values] of Object.entries(applinks.substitutionVariables)) {
          if (/[$()]/.test(name)) error(`Substitution variable "${name}" can't contain $, ( or )`);
          if (!stringArray(values)) error(`Substitution variable "${name}" must be an array of strings`);
          else aasa.variables[name] = values as string[];
        }
    }
    if (!Array.isArray(applinks.details)) {
      error("applinks.details must be an array");
    } else {
      applinks.details.forEach((raw, i) => {
        const where = `details[${i}]`;
        if (!isObject(raw)) return error(`${where} must be an object`);
        const ids: string[] = [];
        if (typeof raw.appID === "string") ids.push(raw.appID);
        if (raw.appIDs !== undefined) {
          if (stringArray(raw.appIDs)) ids.push(...(raw.appIDs as string[]));
          else error(`${where}.appIDs must be an array of strings`);
        }
        if (ids.length === 0) error(`${where} needs appID or appIDs`);
        ids.forEach((id) => checkAppId(id, where));

        const detail: Detail = { appIDs: ids, defaults: readOptions(raw.defaults, defaults) };
        if (raw.components !== undefined) {
          if (!Array.isArray(raw.components)) error(`${where}.components must be an array`);
          else {
            detail.components = [];
            raw.components.forEach((c, j) => {
              const at = `${where}.components[${j}]`;
              if (!isObject(c)) return error(`${at} must be an object`);
              for (const key of Object.keys(c)) if (!COMPONENT_KEYS.has(key)) warn(`${at}: unknown key "${key}"`);
              for (const key of ["/", "#"] as const)
                if (c[key] !== undefined && typeof c[key] !== "string") error(`${at}["${key}"] must be a string`);
              const query = c["?"];
              if (query !== undefined && typeof query !== "string" && !(isObject(query) && Object.values(query).every((v) => typeof v === "string")))
                error(`${at}["?"] must be a string or an object of strings`);
              detail.components!.push(c as Component);
            });
          }
        }
        if (raw.paths !== undefined) {
          if (!stringArray(raw.paths)) error(`${where}.paths must be an array of strings`);
          else detail.paths = raw.paths as string[];
        }
        if (!detail.components && !detail.paths) error(`${where} needs components or paths`);
        if (detail.components && detail.paths) warn(`${where} has both components and paths; iOS 13 and later use components`);
        aasa.details.push(detail);
      });
    }
  }

  for (const service of ["webcredentials", "appclips"] as const) {
    const section = root[service];
    if (section === undefined) continue;
    if (!isObject(section) || !stringArray(section.apps)) {
      error(`${service}.apps must be an array of strings`);
      continue;
    }
    aasa[service] = section.apps as string[];
    (section.apps as string[]).forEach((id) => checkAppId(id, `${service}.apps`));
  }

  for (const key of Object.keys(root))
    if (!["applinks", "webcredentials", "appclips", "activitycontinuation"].includes(key)) warn(`Unknown top-level key "${key}"`);

  return { aasa, issues, size };
}

const builtins: Record<string, string> = {
  alpha: "[A-Za-z]",
  upper: "[A-Z]",
  lower: "[a-z]",
  alnum: "[A-Za-z0-9]",
  digit: "[0-9]",
  xdigit: "[0-9A-Fa-f]",
  // Approximations of Locale.isoRegionCodes / isoLanguageCodes.
  region: "[A-Z]{2}",
  lang: "[a-z]{2,3}",
};

const escape = (s: string) => s.replace(/[.+^${}()|[\]\\]/g, "\\$&");

function wildcards(pattern: string): string {
  return [...pattern].map((ch) => (ch === "*" ? ".*" : ch === "?" ? "." : escape(ch))).join("");
}

/** A regex source for an AASA pattern with wildcards and `$(name)` variables. */
export function patternSource(pattern: string, variables: Record<string, string[]>): string {
  let out = "";
  let rest = pattern;
  for (;;) {
    const m = /\$\(([^$()]+)\)/.exec(rest);
    if (!m) return out + wildcards(rest);
    out += wildcards(rest.slice(0, m.index));
    const name = m[1];
    const values = variables[name];
    out += values ? `(?:${values.map(wildcards).join("|")})` : (builtins[name] ?? escape(m[0]));
    rest = rest.slice(m.index + m[0].length);
  }
}

function matches(pattern: string, value: string, variables: Record<string, string[]>, caseSensitive: boolean) {
  return new RegExp(`^${patternSource(pattern, variables)}$`, caseSensitive ? "" : "i").test(value);
}

function decode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export interface UrlParts {
  path: string;
  query: string;
  fragment: string;
}

export function urlParts(input: string): UrlParts {
  const url = new URL(/^[a-z]+:\/\//i.test(input) ? input : `https://example.com${input.startsWith("/") ? "" : "/"}${input}`);
  return { path: url.pathname, query: url.search.replace(/^\?/, ""), fragment: url.hash.replace(/^#/, "") };
}

function componentMatches(c: Component, url: UrlParts, detail: Detail, variables: Record<string, string[]>): boolean {
  const caseSensitive = c.caseSensitive ?? detail.defaults.caseSensitive;
  const encoded = c.percentEncoded ?? detail.defaults.percentEncoded;
  const value = (s: string) => (encoded ? s : decode(s));
  const test = (pattern: string, s: string) => matches(pattern, value(s), variables, caseSensitive);

  if (c["/"] !== undefined) {
    // Apple's own example uses "abc" for the path "/abc".
    const path = c["/"].startsWith("/") || c["/"].startsWith("*") ? c["/"] : `/${c["/"]}`;
    if (!test(path, url.path)) return false;
  }
  const query = c["?"];
  if (typeof query === "string") {
    if (!test(query, url.query)) return false;
  } else if (query) {
    const params = new URLSearchParams(url.query);
    for (const [name, pattern] of Object.entries(query)) {
      const actual = params.get(name);
      if (actual === null || !matches(pattern, encoded ? actual : decode(actual), variables, caseSensitive)) return false;
    }
  }
  if (c["#"] !== undefined && !test(c["#"], url.fragment)) return false;
  return true;
}

export interface MatchResult {
  url: string;
  error?: string;
  /** App IDs that open this URL, empty when none. */
  appIDs: string[];
  rule?: string;
  /** Rules that excluded this URL for some apps before a match. */
  excludedBy: string[];
}

const describeComponent = (c: Component) =>
  c.comment ?? JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k]) => k !== "comment")));

/** Which app opens the URL. Details and their rules are checked in order; first match wins. */
export function matchUrl(aasa: Aasa, input: string): MatchResult {
  const result: MatchResult = { url: input, appIDs: [], excludedBy: [] };
  let url: UrlParts;
  try {
    url = urlParts(input.trim());
  } catch {
    return { ...result, error: "Not a valid URL" };
  }
  for (const detail of aasa.details) {
    if (detail.components) {
      const hit = detail.components.find((c) => componentMatches(c, url, detail, aasa.variables));
      if (!hit) continue;
      if (hit.exclude) {
        result.excludedBy.push(describeComponent(hit));
        continue;
      }
      return { ...result, appIDs: detail.appIDs, rule: describeComponent(hit) };
    }
    if (detail.paths) {
      const hit = detail.paths.find((p) => {
        const pattern = p.startsWith("NOT ") ? p.slice(4) : p;
        return matches(pattern, url.path, aasa.variables, true);
      });
      if (!hit) continue;
      if (hit.startsWith("NOT ")) {
        result.excludedBy.push(hit);
        continue;
      }
      return { ...result, appIDs: detail.appIDs, rule: hit };
    }
  }
  return result;
}

export const sampleAasa = `{
  "applinks": {
    "substitutionVariables": {
      "food": ["burrito", "pizza", "sushi"]
    },
    "details": [
      {
        "appIDs": ["ABCDE12345.com.example.app"],
        "components": [
          { "/": "/help/website/*", "exclude": true, "comment": "Help pages stay on the web" },
          { "/": "/$(lang)_$(region)/$(food)/" },
          { "/": "/orders/?*", "?": { "ref": "?*" } },
          { "/": "/products/*" }
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["ABCDE12345.com.example.app"]
  }
}
`;

export const sampleUrls = `https://example.com/products/42
https://example.com/help/website/faq
https://example.com/en_US/pizza/
https://example.com/orders/7?ref=mail
https://example.com/orders/7
https://example.com/about`;
