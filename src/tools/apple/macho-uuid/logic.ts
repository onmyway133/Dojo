/** Crash logs print UUIDs in lowercase without dashes, dwarfdump in uppercase with them. */
export const normalizeUuid = (uuid: string) => uuid.trim().toLowerCase().replace(/[^0-9a-f]/g, "");

export function findMatch<T extends { uuid?: string | null }>(archs: T[], expected: string): T | undefined {
  const target = normalizeUuid(expected);
  if (target.length !== 32) return undefined;
  return archs.find((a) => a.uuid && normalizeUuid(a.uuid) === target);
}
