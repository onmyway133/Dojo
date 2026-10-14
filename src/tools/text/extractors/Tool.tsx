import { useCallback } from "react";
import { type Choice, Option, OptionSelect, OptionSwitch, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { type ExtractKind, extract } from "./logic";

const kindChoices: Choice<ExtractKind>[] = [
  { value: "emails", label: "Emails" },
  { value: "urls", label: "URLs" },
  { value: "ipv4", label: "IPv4 addresses" },
  { value: "ipv6", label: "IPv6 addresses" },
  { value: "numbers", label: "Numbers" },
  { value: "hexColors", label: "Hex colors" },
  { value: "hashtags", label: "Hashtags" },
  { value: "mentions", label: "@mentions" },
];

const sample = `Hi team, ping @ada or mail ada@example.com and ops@dojo.dev.
Docs: https://github.com/indiegoodies/Dojo and https://example.com/a?b=1.
Servers 10.0.0.12, 10.0.0.13 and 2001:db8::1 answered in 42 ms, 38.5 ms and 120 ms.
Brand colors #0a84ff and #30d158. #release #macos`;

export default function ExtractorsTool() {
  const [kind, setKind] = usePersistentState<ExtractKind>("kind", "emails");
  const [unique, setUnique] = usePersistentState("unique", true);
  const [sort, setSort] = usePersistentState("sort", false);
  const transform = useCallback((input: string) => extract(input, kind, { unique, sort }).join("\n"), [kind, unique, sort]);
  const label = kindChoices.find((c) => c.value === kind)?.label as string;

  return (
    <TransformTool
      transform={transform}
      inputTitle="Text"
      outputTitle={label}
      sample={sample}
      placeholder="Paste text, logs or HTML"
      options={
        <ToolOptions>
          <Option label="Extract">
            <OptionSelect value={kind} onChange={setKind} choices={kindChoices} className="min-w-44" />
          </Option>
          <OptionSwitch label="Unique" checked={unique} onChange={setUnique} />
          <OptionSwitch label="Sort" checked={sort} onChange={setSort} />
        </ToolOptions>
      }
    />
  );
}
