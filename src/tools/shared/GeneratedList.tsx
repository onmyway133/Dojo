import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { CopyButton, ResultList, ResultRow, ToolSection } from "@/components/tool";
import { Button } from "@/components/ui/button";

interface GeneratedListProps {
  title: string;
  values: string[];
  onRegenerate: () => void;
  /** Label per row, defaults to the 1-based index. */
  label?: (index: number) => ReactNode;
  meta?: ReactNode;
}

/** A panel of generated values with Regenerate and Copy All. Used by ID and secret generators. */
export function GeneratedList({ title, values, onRegenerate, label, meta }: GeneratedListProps) {
  return (
    <ToolSection
      title={title}
      meta={meta}
      actions={
        <>
          <CopyButton label="Copy All" value={values.join("\n")} />
          <Button variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCw /> Regenerate
          </Button>
        </>
      }
      fill
      className="overflow-y-auto"
    >
      <ResultList>
        {values.map((value, index) => (
          <ResultRow key={`${index}-${value}`} label={label ? label(index) : index + 1} compact={!label} value={value} mono />
        ))}
      </ResultList>
    </ToolSection>
  );
}
