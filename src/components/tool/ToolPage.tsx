import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsFavorite, useLibrary } from "@/stores/library";
import { IconAction } from "./IconAction";
import { PageHeader } from "./PageHeader";
import { useToolMeta } from "./ToolContext";

interface ToolPageProps {
  children: ReactNode;
  /** Extra header buttons, placed before the favorite toggle. */
  actions?: ReactNode;
  /**
   * `fill`: sections share the window height and scroll inside (editor tools).
   * `scroll`: sections keep their natural height and the page scrolls (forms, lists).
   */
  layout?: "fill" | "scroll";
  className?: string;
}

/** The frame of every tool: header from the tool's metadata, then its sections. */
export function ToolPage({ children, actions, layout = "fill", className }: ToolPageProps) {
  const meta = useToolMeta();
  const favorite = useIsFavorite(meta.id);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        icon={meta.icon}
        title={meta.name}
        description={meta.description}
        actions={
          <>
            {actions}
            <IconAction
              variant="toolbar"
              size="icon"
              label={favorite ? "Remove from Favorites" : "Add to Favorites"}
              aria-pressed={favorite}
              onClick={() => toggleFavorite(meta.id)}
            >
              <Star className={cn(favorite && "fill-warning text-warning")} />
            </IconAction>
          </>
        }
      />
      <div
        className={cn(
          "@container flex min-h-0 flex-1 flex-col gap-4 px-5 pt-4 pb-5",
          layout === "scroll" && "overflow-y-auto",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
