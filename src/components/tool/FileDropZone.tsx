import { FileUp, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useFileDrop } from "@/hooks/useFileDrop";
import { type FileFilter, pickFile } from "@/lib/files";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFile: (path: string) => void;
  filters?: FileFilter[];
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

/** Click to choose or drop a file anywhere on the window. A filled well, no dashed border. */
export function FileDropZone({
  onFile,
  filters,
  title = "Drop a file or click to choose",
  subtitle,
  icon: Icon = FileUp,
  className,
}: FileDropZoneProps) {
  const dragging = useFileDrop((paths) => onFile(paths[0]));

  async function choose() {
    try {
      const path = await pickFile(filters);
      if (path) onFile(path);
    } catch (error) {
      toast.error("Couldn't open the file", { description: String(error) });
    }
  }

  return (
    <button
      type="button"
      onClick={choose}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl px-6 py-8 text-center outline-none transition-colors",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        dragging ? "bg-selected text-primary" : "bg-field hover:bg-field-hover",
        className,
      )}
    >
      <Icon className={cn("size-7", dragging ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
      <span className="text-[13px] font-medium">{dragging ? "Drop to open" : title}</span>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </button>
  );
}
