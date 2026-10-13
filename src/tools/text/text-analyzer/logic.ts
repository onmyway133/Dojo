export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  bytes: number;
  /** Minutes at 238 words per minute (average silent reading speed). */
  readingMinutes: number;
  speakingMinutes: number;
  topWords: [string, number][];
}

/** Sentences end in . ! ? or …; a trailing fragment with letters counts as one more. */
function countSentences(text: string): number {
  const ended = text.match(/[^.!?…]*[\p{L}\p{N}][^.!?…]*[.!?…]+/gu) ?? [];
  const rest = text.replace(/[^.!?…]*[.!?…]+/g, "");
  return ended.length + (/[\p{L}\p{N}]/u.test(rest) ? 1 : 0);
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function analyze(text: string, topCount = 10): TextStats {
  const graphemes = [...segmenter.segment(text)].length;
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) ?? [];
  const counts = new Map<string, number>();
  for (const word of words) {
    const key = word.toLowerCase();
    if (key.length > 2) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return {
    characters: graphemes,
    charactersNoSpaces: [...segmenter.segment(text.replace(/\s+/g, ""))].length,
    words: words.length,
    lines: text ? text.split(/\r?\n/).length : 0,
    sentences: countSentences(text),
    paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim()).length,
    bytes: new TextEncoder().encode(text).length,
    readingMinutes: words.length / 238,
    speakingMinutes: words.length / 150,
    topWords: [...counts].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, topCount),
  };
}

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0 sec";
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))} sec`;
  const whole = Math.floor(minutes);
  const seconds = Math.round((minutes - whole) * 60);
  return seconds ? `${whole} min ${seconds} sec` : `${whole} min`;
}
