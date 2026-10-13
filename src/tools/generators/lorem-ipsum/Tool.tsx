import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type Choice,
  CodeEditor,
  CopyButton,
  Option,
  OptionSwitch,
  Segmented,
  ToolOptions,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { describeText } from "@/tools/shared/text";
import { lorem, type LoremUnit } from "./logic";

const unitChoices: Choice<LoremUnit>[] = [
  { value: "words", label: "Words" },
  { value: "sentences", label: "Sentences" },
  { value: "paragraphs", label: "Paragraphs" },
];

export default function LoremIpsumTool() {
  const [unit, setUnit] = usePersistentState<LoremUnit>("unit", "paragraphs");
  const [count, setCount] = usePersistentState("count", 3);
  const [classic, setClassic] = usePersistentState("classic", true);
  const [seed, setSeed] = useState(0);

  const text = useMemo(
    () => lorem(unit, Math.max(1, Math.min(500, count)), classic),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit, count, classic, seed],
  );

  return (
    <ToolPage>
      <ToolOptions>
        <Option label="Generate">
          <Input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
            className="h-7 w-20 text-[13px]"
          />
          <Segmented value={unit} onChange={setUnit} choices={unitChoices} />
        </Option>
        <OptionSwitch label="Start with “Lorem ipsum”" checked={classic} onChange={setClassic} />
      </ToolOptions>
      <ToolSection
        title="Text"
        meta={describeText(text)}
        actions={
          <>
            <CopyButton value={text} />
            <Button variant="ghost" size="sm" onClick={() => setSeed((s) => s + 1)}>
              <RefreshCw /> Regenerate
            </Button>
          </>
        }
        fill
        padded={false}
      >
        <CodeEditor value={text} readOnly lineNumbers={false} />
      </ToolSection>
    </ToolPage>
  );
}
