import { Search, X } from "lucide-react";
import { useRef } from "react";
import { useHotkey } from "@/hooks/useHotkey";
import { useSearch } from "@/stores/search";

interface SidebarSearchProps {
  /** Called on Enter, usually to open the first match. */
  onSubmit: () => void;
}

export function SidebarSearch({ onSubmit }: SidebarSearchProps) {
  const query = useSearch((s) => s.query);
  const setQuery = useSearch((s) => s.setQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkey({ key: "f", meta: true }, () => inputRef.current?.select());

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") setQuery("");
        }}
        placeholder="Search"
        spellCheck={false}
        className="ds-field h-7 w-full rounded-full! pr-7 pl-7 text-[13px] outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery("")}
          className="absolute top-1/2 right-1.5 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/40 text-background hover:bg-muted-foreground/60"
        >
          <X className="size-2.5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
