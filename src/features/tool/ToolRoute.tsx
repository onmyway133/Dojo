import { Suspense, useEffect } from "react";
import { useParams } from "react-router";
import { ToolContext } from "@/components/tool/ToolContext";
import { getTool, getToolView } from "@/tools/registry";
import { useLibrary } from "@/stores/library";
import { NotFound } from "./NotFound";

export function ToolRoute() {
  const { toolId } = useParams();
  const meta = getTool(toolId);
  const View = meta ? getToolView(meta.id) : undefined;
  const markOpened = useLibrary((s) => s.markOpened);

  useEffect(() => {
    if (meta) markOpened(meta.id);
  }, [meta, markOpened]);

  if (!meta || !View) return <NotFound />;

  return (
    <ToolContext value={meta}>
      <Suspense fallback={null}>
        {/* Keyed so switching tools never reuses component state. */}
        <View key={meta.id} />
      </Suspense>
    </ToolContext>
  );
}
