"use client"

import { Switch as SwitchPrimitive } from "radix-ui"
import * as React from "react"
import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "ds-switch peer relative inline-flex shrink-0 items-center rounded-full outline-none transition-[background,box-shadow] focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="ds-switch-thumb pointer-events-none block rounded-full transition-transform"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
