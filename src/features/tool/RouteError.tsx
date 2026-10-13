import { TriangleAlert } from "lucide-react";
import { useRouteError } from "react-router";
import { PageHeader } from "@/components/tool/PageHeader";
import { Button } from "@/components/ui/button";

/** Shown when a page throws or a tool's code fails to load. */
export function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex h-full flex-col">
      <PageHeader icon={TriangleAlert} title="Something went wrong" description={message} />
      <div className="px-6">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </div>
  );
}
