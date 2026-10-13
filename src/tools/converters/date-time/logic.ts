import { TZDate } from "@date-fns/tz";
import { format, formatDistanceStrict, getDayOfYear, getISOWeek } from "date-fns";

export type ParsedDate = { ok: true; date: Date; detected: string } | { ok: false; error: string };

/**
 * Accepts a Unix timestamp in seconds, milliseconds, microseconds or nanoseconds
 * (picked by magnitude), or any date string the platform can parse.
 */
export function parseDateInput(text: string): ParsedDate {
  const trimmed = text.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    const abs = Math.abs(n);
    if (abs >= 1e17) return valid(new Date(n / 1e6), "Unix nanoseconds");
    if (abs >= 1e14) return valid(new Date(n / 1e3), "Unix microseconds");
    if (abs >= 1e11) return valid(new Date(n), "Unix milliseconds");
    return valid(new Date(n * 1000), "Unix seconds");
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Not a recognised date or timestamp" };
  return valid(date, "Date string");
}

function valid(date: Date, detected: string): ParsedDate {
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Date is out of range" };
  return { ok: true, date, detected };
}

/** ISO 8601 with the zone's offset, e.g. 2026-10-13T21:30:00+02:00. */
export function isoInZone(date: Date, timeZone: string): string {
  return format(new TZDate(date, timeZone), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
}

export function formatInZone(date: Date, timeZone: string, pattern: string): string {
  return format(new TZDate(date, timeZone), pattern);
}

export function describeDate(date: Date, timeZone: string, now = new Date()) {
  const zoned = new TZDate(date, timeZone);
  return {
    unixSeconds: String(Math.floor(date.getTime() / 1000)),
    unixMillis: String(date.getTime()),
    isoUtc: date.toISOString(),
    isoZone: isoInZone(date, timeZone),
    rfc2822: format(zoned, "EEE, dd MMM yyyy HH:mm:ss xx"),
    readable: new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "long", timeZone }).format(date),
    relative: formatDistanceStrict(date, now, { addSuffix: true }),
    dayOfYear: String(getDayOfYear(zoned)),
    isoWeek: String(getISOWeek(zoned)),
  };
}
