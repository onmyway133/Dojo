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
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-(--ds-search-placeholder)" />
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
        className="ds-search h-[30px] w-full pr-8 pl-8.5 text-[14px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery("")}
          className="absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/40 text-background hover:bg-muted-foreground/60"
        >
          <X className="size-2.5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
