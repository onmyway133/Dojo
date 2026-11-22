// Payload keys and limits from Apple's "Generating a remote notification" and "Sending
// notification requests to APNs": 4 KB per payload, 5 KB for VoIP.

export type PushType = "alert" | "background" | "voip";
export type InterruptionLevel = "default" | "passive" | "active" | "time-sensitive" | "critical";

export interface PayloadForm {
  pushType: PushType;
  title: string;
  subtitle: string;
  body: string;
  badge: string;
  sound: string;
  threadId: string;
  category: string;
  contentAvailable: boolean;
  mutableContent: boolean;
  interruptionLevel: InterruptionLevel;
  relevanceScore: string;
  /** JSON object merged next to `aps`. */
  custom: string;
}

export const emptyForm: PayloadForm = {
  pushType: "alert",
  title: "Order shipped",
  subtitle: "",
  body: "Your package is on its way",
  badge: "1",
  sound: "default",
  threadId: "",
  category: "",
  contentAvailable: false,
  mutableContent: false,
  interruptionLevel: "default",
  relevanceScore: "",
  custom: '{\n  "orderId": "42"\n}',
};

export const sizeLimit = (pushType: PushType) => (pushType === "voip" ? 5120 : 4096);

const APS_KEYS = new Set([
  "alert", "badge", "sound", "thread-id", "category", "content-available", "mutable-content",
  "target-content-id", "interruption-level", "relevance-score", "filter-criteria",
  "stale-date", "content-state", "timestamp", "event", "dismissal-date", "attributes-type", "attributes",
]);

export function buildPayload(form: PayloadForm): Record<string, unknown> {
  const aps: Record<string, unknown> = {};
  const alert: Record<string, string> = {};
  if (form.title.trim()) alert.title = form.title;
  if (form.subtitle.trim()) alert.subtitle = form.subtitle;
  if (form.body.trim()) alert.body = form.body;
  if (Object.keys(alert).length) aps.alert = alert;

  if (form.badge.trim()) {
    const badge = Number(form.badge);
    if (!Number.isInteger(badge) || badge < 0) throw new Error("Badge must be a whole number, 0 clears it");
    aps.badge = badge;
  }
  if (form.sound.trim()) aps.sound = form.sound.trim();
  if (form.threadId.trim()) aps["thread-id"] = form.threadId.trim();
  if (form.category.trim()) aps.category = form.category.trim();
  if (form.contentAvailable) aps["content-available"] = 1;
  if (form.mutableContent) aps["mutable-content"] = 1;
  if (form.interruptionLevel !== "default") aps["interruption-level"] = form.interruptionLevel;
  if (form.relevanceScore.trim()) {
    const score = Number(form.relevanceScore);
    if (Number.isNaN(score)) throw new Error("Relevance score must be a number from 0 to 1");
    aps["relevance-score"] = score;
  }

  let custom: unknown = {};
  if (form.custom.trim()) {
    try {
      custom = JSON.parse(form.custom);
    } catch (e) {
      throw new Error(`Custom data: ${(e as Error).message}`);
    }
    if (typeof custom !== "object" || custom === null || Array.isArray(custom)) throw new Error("Custom data must be a JSON object");
  }
  const { aps: customAps, ...rest } = custom as Record<string, unknown>;
  return { aps: { ...aps, ...(typeof customAps === "object" && customAps ? customAps : {}) }, ...rest };
}

/** Bytes APNs counts: the UTF-8 length of the JSON as sent (minified). */
export const payloadSize = (payload: unknown) => new TextEncoder().encode(JSON.stringify(payload)).length;

export interface Lint {
  level: "error" | "warning";
  message: string;
}

export function lintPayload(payload: Record<string, unknown>, pushType: PushType): Lint[] {
  const lints: Lint[] = [];
  const size = payloadSize(payload);
  const limit = sizeLimit(pushType);
  if (size > limit) lints.push({ level: "error", message: `Payload is ${size} bytes, over the ${limit} byte limit` });

  const aps = payload.aps as Record<string, unknown> | undefined;
  if (!aps || typeof aps !== "object") {
    lints.push({ level: "error", message: "Missing the aps dictionary" });
    return lints;
  }
  for (const key of Object.keys(aps))
    if (!APS_KEYS.has(key)) lints.push({ level: "warning", message: `"${key}" inside aps is ignored by APNs; put custom keys next to aps` });

  const visible = "alert" in aps || "badge" in aps || "sound" in aps;
  if (pushType === "background") {
    if (aps["content-available"] !== 1) lints.push({ level: "error", message: "Background pushes need content-available: 1" });
    if (visible) lints.push({ level: "warning", message: "Background pushes shouldn't include alert, badge or sound; send them as alert type instead" });
  }
  if (pushType === "alert" && !visible && aps["content-available"] === 1)
    lints.push({ level: "warning", message: "Nothing visible: use the background push type for silent pushes" });
  if (aps["mutable-content"] === 1 && !("alert" in aps))
    lints.push({ level: "warning", message: "mutable-content only runs the service extension for pushes with an alert" });
  const score = aps["relevance-score"];
  if (typeof score === "number" && (score < 0 || score > 1)) lints.push({ level: "warning", message: "relevance-score should be between 0 and 1" });
  if (aps["interruption-level"] === "critical") lints.push({ level: "warning", message: "Critical alerts need the critical alerts entitlement from Apple" });
  return lints;
}

export interface CurlOptions {
  topic: string;
  token: string;
  sandbox: boolean;
}

/** A curl call to the APNs HTTP/2 API with token-based auth. */
export function curlCommand(payload: unknown, pushType: PushType, { topic, token, sandbox }: CurlOptions): string {
  const host = sandbox ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  const bundle = topic.trim() || "com.example.app";
  const apnsTopic = pushType === "voip" ? `${bundle}.voip` : bundle;
  const priority = pushType === "background" ? 5 : 10;
  const body = JSON.stringify(payload).replace(/'/g, "'\\''");
  return [
    "curl --http2 \\",
    `  --header "apns-topic: ${apnsTopic}" \\`,
    `  --header "apns-push-type: ${pushType}" \\`,
    `  --header "apns-priority: ${priority}" \\`,
    '  --header "authorization: bearer $AUTHENTICATION_TOKEN" \\',
    `  --data '${body}' \\`,
    `  https://${host}/3/device/${token.trim() || "$DEVICE_TOKEN"}`,
  ].join("\n");
}
