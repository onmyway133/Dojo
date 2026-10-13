import semver from "semver";

export interface VersionInfo {
  version: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
  build: string;
}

export function parseVersion(text: string): VersionInfo | undefined {
  const parsed = semver.parse(text.trim(), { loose: true });
  if (!parsed) return undefined;
  return {
    version: parsed.version,
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    prerelease: parsed.prerelease.join("."),
    build: parsed.build.join("."),
  };
}

export type Bump = "major" | "minor" | "patch" | "premajor" | "preminor" | "prepatch" | "prerelease";
export const bumps: Bump[] = ["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"];

export const bump = (version: string, kind: Bump, preid: string) =>
  (preid ? semver.inc(version, kind, preid) : semver.inc(version, kind)) ?? "";

/** "<", "=" or ">" comparing a to b. */
export function compareVersions(a: string, b: string): "<" | "=" | ">" | undefined {
  if (!semver.valid(a, { loose: true }) || !semver.valid(b, { loose: true })) return undefined;
  const order = semver.compare(a, b, { loose: true });
  return order < 0 ? "<" : order > 0 ? ">" : "=";
}

export interface RangeCheck {
  valid: boolean;
  satisfies?: boolean;
  /** Plain-language bounds, e.g. ">=1.2.0 <2.0.0-0". */
  normalized?: string;
}

export function checkRange(version: string, range: string): RangeCheck {
  const normalized = semver.validRange(range, { loose: true });
  if (!normalized) return { valid: false };
  return {
    valid: true,
    normalized,
    satisfies: semver.valid(version, { loose: true }) ? semver.satisfies(version, range, { loose: true, includePrerelease: false }) : undefined,
  };
}
