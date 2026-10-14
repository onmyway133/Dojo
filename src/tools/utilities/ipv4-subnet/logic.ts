export function parseIpv4(text: string): number {
  const parts = text.trim().split(".");
  if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) {
    throw new Error(`"${text.trim()}" isn't an IPv4 address`);
  }
  return parts.reduce((acc, p) => acc * 256 + Number(p), 0);
}

export const formatIpv4 = (value: number) =>
  [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join(".");

/** Prefix length from a dotted mask such as 255.255.255.0; rejects non-contiguous masks. */
function prefixFromMask(mask: number): number {
  const bits = mask.toString(2).padStart(32, "0");
  if (!/^1*0*$/.test(bits)) throw new Error("The subnet mask must be contiguous ones followed by zeros");
  return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
}

export interface Subnet {
  address: number;
  prefix: number;
  network: number;
  broadcast: number;
  mask: number;
  wildcard: number;
  firstHost: number;
  lastHost: number;
  /** Usable hosts; /31 and /32 count every address (RFC 3021 point-to-point and single host). */
  hosts: number;
  total: number;
}

/** Accepts `10.0.0.1/24`, `10.0.0.1 255.255.255.0` or a bare address (treated as /32). */
export function parseCidr(text: string): Subnet {
  const [ip, rest] = text.trim().split(/\s*\/\s*|\s+/, 2);
  const address = parseIpv4(ip);
  let prefix = 32;
  if (rest !== undefined && rest !== "") {
    if (/^\d{1,2}$/.test(rest)) prefix = Number(rest);
    else prefix = prefixFromMask(parseIpv4(rest));
  }
  if (prefix < 0 || prefix > 32) throw new Error("Prefix length must be 0 to 32");

  const total = 2 ** (32 - prefix);
  const network = Math.floor(address / total) * total;
  const broadcast = network + total - 1;
  const mask = 2 ** 32 - total;
  const small = prefix >= 31;
  return {
    address,
    prefix,
    network,
    broadcast,
    mask,
    wildcard: total - 1,
    firstHost: small ? network : network + 1,
    lastHost: small ? broadcast : broadcast - 1,
    hosts: small ? total : total - 2,
    total,
  };
}

const inRange = (value: number, cidr: string) => {
  const s = parseCidr(cidr);
  return value >= s.network && value <= s.broadcast;
};

/** What kind of address this is, from the IANA special-purpose registry's main entries. */
export function addressKind(value: number): string {
  if (inRange(value, "10.0.0.0/8") || inRange(value, "172.16.0.0/12") || inRange(value, "192.168.0.0/16")) return "Private (RFC 1918)";
  if (inRange(value, "127.0.0.0/8")) return "Loopback";
  if (inRange(value, "169.254.0.0/16")) return "Link-local";
  if (inRange(value, "100.64.0.0/10")) return "Carrier-grade NAT (RFC 6598)";
  if (inRange(value, "224.0.0.0/4")) return "Multicast";
  if (inRange(value, "0.0.0.0/8")) return "This network";
  if (inRange(value, "192.0.2.0/24") || inRange(value, "198.51.100.0/24") || inRange(value, "203.0.113.0/24")) return "Documentation";
  if (inRange(value, "240.0.0.0/4")) return "Reserved";
  return "Public";
}

export function addressClass(value: number): string {
  const first = Math.floor(value / 2 ** 24);
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D (multicast)";
  return "E (reserved)";
}

export const toBinary = (value: number) =>
  [24, 16, 8, 0].map((shift) => (Math.floor(value / 2 ** shift) % 256).toString(2).padStart(8, "0")).join(".");

export const toHex = (value: number) => `0x${value.toString(16).padStart(8, "0").toUpperCase()}`;
