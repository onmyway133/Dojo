import { Star } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { useIsFavorite, useLibrary } from "@/stores/library";
import type { ToolMeta } from "@/tools/types";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const favorite = useIsFavorite(tool.id);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const Icon = tool.icon;

  return (
    <div className="group relative">
      <Link
        to={`/tools/${tool.id}`}
        draggable={false}
        className="ds-card flex h-full flex-col gap-3 p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="ds-icon-tile flex size-9 items-center justify-center rounded-[9px]">
          <Icon className="relative size-[18px]" strokeWidth={1.9} />
        </div>
        <div className="min-w-0">
          <h3 className="ds-title truncate pr-6 text-[13px] font-semibold">{tool.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{tool.description}</p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={favorite ? `Remove ${tool.name} from Favorites` : `Add ${tool.name} to Favorites`}
        onClick={() => toggleFavorite(tool.id)}
        className={cn(
          "absolute top-3 right-3 flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-field-hover focus-visible:opacity-100",
          favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <Star className={cn("size-4", favorite && "fill-warning text-warning")} />
      </button>
    </div>
  );
}
