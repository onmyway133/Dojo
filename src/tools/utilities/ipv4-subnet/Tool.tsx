import { Chip, ResultList, ResultRow, StatusMessage, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Input } from "@/components/ui/input";
import { addressClass, addressKind, formatIpv4, parseCidr, type Subnet, toBinary, toHex } from "./logic";

const prefixes = [8, 16, 20, 24, 26, 28, 30, 32];
const count = new Intl.NumberFormat("en-US");

function calculate(text: string): { subnet?: Subnet; error?: string } {
  try {
    return { subnet: parseCidr(text) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function Ipv4SubnetTool() {
  const [input, setInput] = usePersistentState("input", "192.168.1.130/26");
  const { subnet, error } = input.trim() ? calculate(input) : {};
  const address = input.trim().split(/[\s/]/)[0];

  return (
    <ToolPage layout="scroll">
      <ToolSection title="Address">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="10.0.0.1/24 or 10.0.0.1 255.255.255.0"
          spellCheck={false}
          className="max-w-xl font-mono text-[14px]"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prefixes.map((p) => (
            <Chip key={p} selected={subnet?.prefix === p} onClick={() => setInput(`${address}/${p}`)} className="font-mono">
              /{p}
            </Chip>
          ))}
        </div>
        {error && <StatusMessage tone="error" className="mt-3">{error}</StatusMessage>}
      </ToolSection>
      {subnet && (
        <>
          <ToolSection title="Subnet" meta={`${formatIpv4(subnet.network)}/${subnet.prefix}`}>
            <ResultList>
              <ResultRow label="Network" value={formatIpv4(subnet.network)} mono />
              <ResultRow label="Broadcast" value={formatIpv4(subnet.broadcast)} mono />
              <ResultRow label="Subnet mask" value={formatIpv4(subnet.mask)} mono />
              <ResultRow label="Wildcard mask" value={formatIpv4(subnet.wildcard)} mono />
              <ResultRow label="Host range" value={`${formatIpv4(subnet.firstHost)} – ${formatIpv4(subnet.lastHost)}`} mono />
              <ResultRow label="Usable hosts" value={count.format(subnet.hosts)} />
              <ResultRow label="Total addresses" value={count.format(subnet.total)} />
            </ResultList>
          </ToolSection>
          <ToolSection title="Address Details">
            <ResultList>
              <ResultRow label="Type" value={addressKind(subnet.address)} />
              <ResultRow label="Class" value={addressClass(subnet.address)} />
              <ResultRow label="Integer" value={String(subnet.address)} mono />
              <ResultRow label="Hex" value={toHex(subnet.address)} mono />
              <ResultRow label="Binary" value={toBinary(subnet.address)} mono />
              <ResultRow label="Mask binary" value={toBinary(subnet.mask)} mono />
            </ResultList>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
