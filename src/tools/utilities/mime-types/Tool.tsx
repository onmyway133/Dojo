import { FileArchive, FileAudio, FileCode, FileImage, FileQuestion, FileText, FileVideo, type LucideIcon, Type } from "lucide-react";
import db from "mime-db";
import { useMemo } from "react";
import { CopyButton, ToolPage, ToolSection, usePersistentState } from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mimeList, searchMime } from "./logic";

const all = mimeList(db);

const icons: Record<string, LucideIcon> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  text: FileText,
  font: Type,
  application: FileCode,
};

function iconFor(type: string): LucideIcon {
  if (/zip|compressed|tar|gzip|rar|7z/.test(type)) return FileArchive;
  return icons[type.split("/")[0]] ?? FileQuestion;
}

export default function MimeTypesTool() {
  const [query, setQuery] = usePersistentState("query", "");
  const results = useMemo(() => searchMime(all, query), [query]);

  return (
    <ToolPage layout="scroll">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Extension or type, e.g. .webp, photo.heic or application/json"
        spellCheck={false}
        className="h-9 text-[14px]"
        autoFocus
      />
      <ToolSection title={query.trim() ? "Matches" : "Common Types"} meta={`${results.length}${results.length === 100 ? "+" : ""}`}>
        {results.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">No media types match.</p>
        ) : (
          <ul className="-mx-2 flex flex-col gap-0.5">
            {results.map((m) => {
              const Icon = iconFor(m.type);
              return (
                <li key={m.type} className="ds-row group flex items-center gap-3 rounded-lg px-2 py-1.5">
                  <Icon className="size-4 shrink-0 text-(--ds-accent)" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[13px] [overflow-wrap:anywhere] select-text">{m.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.extensions.length > 0 ? m.extensions.map((e) => `.${e}`).join("  ") : "No registered extension"}
                    </div>
                  </div>
                  {m.charset && <Badge variant="secondary">{m.charset}</Badge>}
                  {m.compressible && <Badge variant="outline">Compressible</Badge>}
                  <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <CopyButton value={m.type} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </ToolSection>
    </ToolPage>
  );
}
