import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { ResultList, ResultRow, StatusMessage, ToolPage, ToolSection } from "@/components/tool";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/useAsync";
import { call } from "@/lib/invoke";

interface IpDetails {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  org?: string;
  asn?: string;
}

interface LocalAddress {
  interface: string;
  address: string;
  ipv6: boolean;
}

export default function PublicIpTool() {
  const [refresh, setRefresh] = useState(0);
  const ip = useAsync(() => call<string>("public_ip"), [refresh]);
  const publicIp = ip.status === "success" ? ip.value : undefined;
  const details = useAsync(() => (publicIp ? call<IpDetails>("ip_details", { ip: publicIp }) : undefined), [publicIp]);
  const local = useAsync(() => call<LocalAddress[]>("local_addresses"), [refresh]);
  const info = details.status === "success" ? details.value : undefined;
  const place = info ? [info.city, info.region, info.country_name].filter(Boolean).join(", ") : "";

  return (
    <ToolPage
      layout="scroll"
      actions={
        <Button variant="toolbar" size="sm" onClick={() => setRefresh((r) => r + 1)}>
          <RefreshCw /> Refresh
        </Button>
      }
    >
      <ToolSection title="Public Address" meta="Looked up with ipify and ipapi.co">
        {ip.status === "loading" && <p className="text-[13px] text-muted-foreground">Looking up…</p>}
        {ip.status === "error" && <StatusMessage tone="error">{ip.error}</StatusMessage>}
        {publicIp && (
          <>
            <p className="font-mono text-[24px] font-semibold select-text">{publicIp}</p>
            {details.status === "error" && <StatusMessage className="mt-3">Location unavailable: {details.error}</StatusMessage>}
            {info && (
              <div className="mt-3">
                <ResultList>
                  <ResultRow label="Location" value={place} />
                  <ResultRow label="Postal code" value={info.postal ?? ""} />
                  <ResultRow label="Coordinates" value={info.latitude !== undefined ? `${info.latitude}, ${info.longitude}` : ""} mono />
                  <ResultRow label="Time zone" value={info.timezone ?? ""} />
                  <ResultRow label="Network" value={info.org ?? ""} />
                  <ResultRow label="ASN" value={info.asn ?? ""} mono />
                </ResultList>
              </div>
            )}
          </>
        )}
      </ToolSection>
      <ToolSection title="This Mac" meta="Local network interfaces">
        {local.status === "error" && <StatusMessage tone="error">{local.error}</StatusMessage>}
        {local.status === "success" && (
          <ResultList>
            {local.value.map((a) => (
              <ResultRow key={`${a.interface}-${a.address}`} label={`${a.interface} · ${a.ipv6 ? "IPv6" : "IPv4"}`} value={a.address} mono />
            ))}
          </ResultList>
        )}
      </ToolSection>
    </ToolPage>
  );
}
