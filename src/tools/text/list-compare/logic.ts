export interface CompareOptions {
  ignoreCase: boolean;
  trim: boolean;
}

export interface ListComparison {
  onlyA: string[];
  onlyB: string[];
  both: string[];
}

/** Set comparison of two line lists, keeping first-seen order and original spelling. */
export function compareLists(a: string, b: string, { ignoreCase, trim }: CompareOptions): ListComparison {
  const key = (line: string) => {
    const t = trim ? line.trim() : line;
    return ignoreCase ? t.toLowerCase() : t;
  };
  const toMap = (text: string) => {
    const map = new Map<string, string>();
    for (const line of text.split("\n")) {
      const k = key(line);
      if (k !== "" && !map.has(k)) map.set(k, trim ? line.trim() : line);
    }
    return map;
  };
  const mapA = toMap(a);
  const mapB = toMap(b);
  return {
    onlyA: [...mapA].filter(([k]) => !mapB.has(k)).map(([, v]) => v),
    onlyB: [...mapB].filter(([k]) => !mapA.has(k)).map(([, v]) => v),
    both: [...mapA].filter(([k]) => mapB.has(k)).map(([, v]) => v),
  };
}
