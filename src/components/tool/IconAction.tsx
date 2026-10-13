import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IconActionProps extends ComponentProps<typeof Button> {
  /** Tooltip and accessible name. */
  label: string;
}

/** Small icon-only button with a tooltip, used in page and section headers. */
export function IconAction({ label, children, ...props }: IconActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
