export interface RegexMatch {
  index: number;
  end: number;
  text: string;
  groups: (string | undefined)[];
  named?: Record<string, string | undefined>;
}

export type RegexResult = { ok: true; matches: RegexMatch[]; truncated: boolean } | { ok: false; error: string };

const maxMatches = 2000;

/** All matches of `pattern` in `text`. Always scans globally; guards against empty matches looping. */
export function findMatches(pattern: string, flags: string, text: string): RegexResult {
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
  } catch (error) {
    return { ok: false, error: (error as Error).message.replace(/^Invalid regular expression: /, "") };
  }
  const matches: RegexMatch[] = [];
  for (const m of text.matchAll(regex)) {
    matches.push({ index: m.index, end: m.index + m[0].length, text: m[0], groups: m.slice(1), named: m.groups });
    if (matches.length >= maxMatches) return { ok: true, matches, truncated: true };
    if (!flags.includes("g")) break;
  }
  return { ok: true, matches, truncated: false };
}

/**
 * Name of each capture group in order (undefined for unnamed ones), by walking the
 * pattern's opening parentheses and skipping escapes, classes and non-capturing groups.
 */
export function captureNames(pattern: string): (string | undefined)[] {
  const names: (string | undefined)[] = [];
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (inClass) {
      if (c === "]") inClass = false;
      continue;
    }
    if (c === "[") inClass = true;
    else if (c === "(") {
      if (pattern[i + 1] !== "?") names.push(undefined);
      else {
        const named = /^\(\?<([A-Za-z_$][\w$]*)>/.exec(pattern.slice(i));
        if (named) names.push(named[1]);
      }
    }
  }
  return names;
}

export function replaceAll(pattern: string, flags: string, text: string, replacement: string): string {
  try {
    return text.replace(new RegExp(pattern, flags), replacement);
  } catch {
    return text;
  }
}
