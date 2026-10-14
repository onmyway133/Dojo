export type StrengthTone = "weak" | "fair" | "strong" | "excellent";

/** Label for bits of entropy, shared by the password generator and the strength checker. */
export function strengthLabel(bits: number): { label: string; tone: StrengthTone } {
  if (bits < 50) return { label: "Weak", tone: "weak" };
  if (bits < 70) return { label: "Fair", tone: "fair" };
  if (bits < 100) return { label: "Strong", tone: "strong" };
  return { label: "Excellent", tone: "excellent" };
}

export const strengthBadgeVariant = (tone: StrengthTone) =>
  tone === "weak" ? "destructive" : tone === "fair" ? "secondary" : "default";
