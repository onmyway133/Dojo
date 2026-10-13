import { ChevronRight } from "lucide-react";
import { memo } from "react";
import { CopyButton } from "@/components/tool";
import { cn } from "@/lib/utils";
import { childPath, entriesOf, kindOf } from "./logic";

interface TreeProps {
  expanded: Set<string>;
  onToggle: (path: string) => void;
  /** When searching, only these paths render. */
  visible?: Set<string>;
}

const valueClass = {
  string: "text-[var(--code-string)]",
  number: "text-[var(--code-number)]",
  boolean: "text-[var(--code-keyword)]",
  null: "text-[var(--code-keyword)]",
};

function Primitive({ value }: { value: unknown }) {
  const kind = kindOf(value) as keyof typeof valueClass;
  const text = kind === "string" ? JSON.stringify(value) : String(value);
  return <span className={cn("break-all", valueClass[kind])}>{text}</span>;
}

interface NodeProps extends TreeProps {
  name: string | number | null;
  value: unknown;
  path: string;
  depth: number;
}

const JsonNode = memo(function JsonNode({ name, value, path, depth, expanded, onToggle, visible }: NodeProps) {
  if (visible && !visible.has(path)) return null;
  const kind = kindOf(value);
  const container = kind === "object" || kind === "array";
  const open = container && (expanded.has(path) || visible !== undefined);
  const entries = container ? entriesOf(value) : [];
  const summary = kind === "array" ? `[${entries.length}]` : `{${entries.length}}`;

  return (
    <div>
      <div
        className="ds-row group flex min-h-6 items-start gap-1 rounded-md pr-1"
        style={{ paddingLeft: depth * 16 }}
      >
        <button
          type="button"
          aria-label={open ? "Collapse" : "Expand"}
          onClick={() => container && onToggle(path)}
          className={cn("mt-1 flex size-4 shrink-0 items-center justify-center", !container && "invisible")}
        >
          <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-90")} />
        </button>
        <div className="min-w-0 flex-1 py-0.5 font-mono text-[12.5px] leading-5 select-text">
          {name !== null && (
            <>
              <span className={typeof name === "number" ? "text-muted-foreground" : "text-[var(--code-property)]"}>
                {typeof name === "number" ? name : JSON.stringify(name)}
              </span>
              <span className="text-muted-foreground">: </span>
            </>
          )}
          {container ? (
            <span className="text-muted-foreground">{summary}</span>
          ) : (
            <Primitive value={value} />
          )}
        </div>
        <div className="flex opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <CopyButton label="Copy Path" value={path} />
          <CopyButton
            label="Copy Value"
            value={() => (typeof value === "string" ? value : JSON.stringify(value, null, 2))}
          />
        </div>
      </div>
      {open &&
        entries.map(([key, child]) => (
          <JsonNode
            key={key}
            name={key}
            value={child}
            path={childPath(path, key)}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            visible={visible}
          />
        ))}
    </div>
  );
});

export function JsonTree({ value, ...props }: TreeProps & { value: unknown }) {
  return <JsonNode name={null} value={value} path="$" depth={0} {...props} />;
}
