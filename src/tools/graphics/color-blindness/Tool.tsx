import { FileDropZone, ImagePreview, StatusMessage, ToolPage, ToolSection } from "@/components/tool";
import { fileName, imageFilter } from "@/lib/files";
import { useImageFile } from "@/tools/shared/useImageFile";
import { colorMatrixValues, simulations } from "./logic";

/** Hidden SVG with one filter per simulation, referenced from CSS `filter: url(#…)`. */
function Filters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      {simulations.map((s) => (
        <filter key={s.id} id={`cvd-${s.id}`}>
          <feColorMatrix type="matrix" values={colorMatrixValues(s.matrix)} />
        </filter>
      ))}
    </svg>
  );
}

export default function ColorBlindnessTool() {
  const image = useImageFile();

  return (
    <ToolPage layout="scroll">
      <Filters />
      <FileDropZone onFile={image.setPath} filters={[imageFilter]} title="Drop a screenshot or design, or click to choose" className="shrink-0" />
      {image.error && <StatusMessage tone="error">{image.error}</StatusMessage>}
      {image.preview && image.path && (
        <div className="grid shrink-0 gap-4 @3xl:grid-cols-2">
          <ToolSection title="Original" meta={fileName(image.path)}>
            <ImagePreview src={image.preview} className="h-60" />
          </ToolSection>
          {simulations.map((s) => (
            <ToolSection key={s.id} title={s.name} meta={s.description}>
              <div style={{ filter: `url(#cvd-${s.id})` }}>
                <ImagePreview src={image.preview!} className="h-60" />
              </div>
            </ToolSection>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
