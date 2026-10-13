import { cn } from "@/lib/utils";

const checkerboard = "repeating-conic-gradient(var(--field-hover) 0% 25%, transparent 0% 50%) 50% / 16px 16px";

/** Centered image on a checkerboard so transparency is visible. */
export function ImagePreview({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  return (
    <div
      className={cn("ds-well m-0 flex min-h-40 items-center justify-center overflow-hidden p-3", className)}
      style={{ background: checkerboard }}
    >
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" draggable={false} />
    </div>
  );
}
