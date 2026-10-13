import { SearchX } from "lucide-react";
import { Link } from "react-router";
import { PageHeader } from "@/components/tool/PageHeader";

export function NotFound() {
  return (
    <>
      <PageHeader icon={SearchX} title="Tool not found" />
      <p className="px-6 text-[13px] text-muted-foreground">
        This tool doesn't exist. <Link to="/" className="text-primary">Back to all tools</Link>
      </p>
    </>
  );
}
