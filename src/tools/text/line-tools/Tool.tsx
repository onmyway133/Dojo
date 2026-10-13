import { useCallback } from "react";
import {
  type Choice,
  Option,
  OptionSelect,
  OptionSwitch,
  ToolOptions,
  TransformTool,
  usePersistentState,
} from "@/components/tool";
import { Input } from "@/components/ui/input";
import { type LineOptions, type SortMode, transformLines } from "./logic";

const sortChoices: Choice<SortMode>[] = [
  { value: "none", label: "Keep order" },
  { value: "asc", label: "A → Z" },
  { value: "desc", label: "Z → A" },
  { value: "natural", label: "Natural (file2 < file10)" },
  { value: "length", label: "By length" },
  { value: "shuffle", label: "Shuffle" },
];

const sample = "banana\napple\n\nCherry\napple\n  date  \nitem10\nitem2";

export default function LineToolsTool() {
  const [options, setOptions] = usePersistentState<LineOptions>("options", {
    trim: true,
    removeEmpty: true,
    dedupe: true,
    ignoreCase: false,
    sort: "asc",
    reverse: false,
    prefix: "",
    suffix: "",
  });
  const set = (patch: Partial<LineOptions>) => setOptions((o) => ({ ...o, ...patch }));
  const transform = useCallback((input: string) => transformLines(input, options), [options]);

  return (
    <TransformTool
      transform={transform}
      sample={sample}
      placeholder="One item per line"
      options={
        <ToolOptions>
          <Option label="Sort">
            <OptionSelect value={options.sort} onChange={(sort) => set({ sort })} choices={sortChoices} />
          </Option>
          <OptionSwitch label="Trim" checked={options.trim} onChange={(trim) => set({ trim })} />
          <OptionSwitch label="Remove empty" checked={options.removeEmpty} onChange={(removeEmpty) => set({ removeEmpty })} />
          <OptionSwitch label="Remove duplicates" checked={options.dedupe} onChange={(dedupe) => set({ dedupe })} />
          <OptionSwitch label="Ignore case" checked={options.ignoreCase} onChange={(ignoreCase) => set({ ignoreCase })} />
          <OptionSwitch label="Reverse" checked={options.reverse} onChange={(reverse) => set({ reverse })} />
          <Option label="Wrap">
            <Input value={options.prefix} onChange={(e) => set({ prefix: e.target.value })} placeholder="Prefix" className="h-7 w-24 text-[13px]" />
            <Input value={options.suffix} onChange={(e) => set({ suffix: e.target.value })} placeholder="Suffix" className="h-7 w-24 text-[13px]" />
          </Option>
        </ToolOptions>
      }
    />
  );
}
