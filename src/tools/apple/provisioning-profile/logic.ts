const DAY = 86_400;

export type Validity = { tone: "ok" | "warning" | "error"; label: string };

/** Expired, expiring within 30 days, or valid, relative to `now` (Unix seconds). */
export function expiryStatus(expiration: number | undefined, now = Date.now() / 1000): Validity | undefined {
  if (expiration === undefined) return undefined;
  const days = Math.floor((expiration - now) / DAY);
  if (expiration <= now) return { tone: "error", label: `Expired ${-days} ${-days === 1 ? "day" : "days"} ago` };
  if (days < 30) return { tone: "warning", label: `Expires in ${days} ${days === 1 ? "day" : "days"}` };
  return { tone: "ok", label: `Valid for ${days} days` };
}

/** Entitlements worth calling out when debugging signing problems. */
export function entitlementNotes(entitlements: Record<string, unknown>): string[] {
  const notes: string[] = [];
  const debuggable = entitlements["get-task-allow"] ?? entitlements["com.apple.security.get-task-allow"];
  if (debuggable === true) notes.push("get-task-allow is on: a development build, it can't be uploaded to the App Store");
  const env = entitlements["aps-environment"] ?? entitlements["com.apple.developer.aps-environment"];
  if (typeof env === "string") notes.push(`Push notifications use the ${env} APNs environment`);
  for (const [key, value] of Object.entries(entitlements)) {
    const values = Array.isArray(value) ? value : [value];
    if (values.some((v) => typeof v === "string" && v.includes("*"))) notes.push(`${key} contains a wildcard`);
  }
  return notes;
}
