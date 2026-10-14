export type WifiSecurity = "WPA" | "WEP" | "nopass";

export interface WifiNetwork {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}

// The WIFI: payload escapes these with a backslash.
const escape = (value: string) => value.replace(/([\;,:"])/g, "\\$1");

/** The `WIFI:` payload phone cameras read to join a network. */
export function wifiPayload({ ssid, password, security, hidden }: WifiNetwork): string {
  if (!ssid) throw new Error("Enter the network name");
  const parts = [`T:${security}`, `S:${escape(ssid)}`];
  if (security !== "nopass") parts.push(`P:${escape(password)}`);
  if (hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}
