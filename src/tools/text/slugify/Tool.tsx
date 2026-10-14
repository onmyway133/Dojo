import { useCallback } from "react";
import { type Choice, Option, OptionSwitch, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { type SlugSeparator, slugifyLines } from "./logic";

const separatorChoices: Choice<SlugSeparator>[] = [
  { value: "-", label: "Dash" },
  { value: "_", label: "Underscore" },
  { value: ".", label: "Dot" },
];

export default function SlugifyTool() {
  const [separator, setSeparator] = usePersistentState<SlugSeparator>("separator", "-");
  const [lowercase, setLowercase] = usePersistentState("lowercase", true);
  const transform = useCallback((input: string) => slugifyLines(input, separator, lowercase), [separator, lowercase]);

  return (
    <TransformTool
      transform={transform}
      inputTitle="Text"
      outputTitle="Slugs"
      sample={"Hello, World!\nCrème Brûlée & Tea Recipes\n10 Tips for Faster Builds"}
      options={
        <ToolOptions>
          <Option label="Separator">
            <Segmented value={separator} onChange={setSeparator} choices={separatorChoices} />
          </Option>
          <OptionSwitch label="Lowercase" checked={lowercase} onChange={setLowercase} />
        </ToolOptions>
      }
    />
  );
}
