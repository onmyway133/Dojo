import { ToggleGroup } from "radix-ui";
import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface Choice<T extends string> {
  value: T;
  label: ReactNode;
}

/** A row of options above the editors, drawn as a panel without a title. */
export function ToolOptions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "ds-panel flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2.5 px-4 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Label + control pair inside ToolOptions. */
export function Option({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="ds-panel-title text-[13px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

/** Segmented control. The theme draws the track and the selected segment (`ds-segmented`). */
export function Segmented<T extends string>({
  value,
  onChange,
  choices,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  choices: Choice<T>[];
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      className={cn("ds-segmented inline-flex", className)}
    >
      {choices.map((choice) => (
        <ToggleGroup.Item
          key={choice.value}
          value={choice.value}
          className="ds-segment h-[26px] px-3 text-[13px] font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {choice.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export function OptionSelect<T extends string>({
  value,
  onChange,
  choices,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  choices: Choice<T>[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as T)}>
      <SelectTrigger className={cn("min-w-28 text-[13px]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {choices.map((choice) => (
          <SelectItem key={choice.value} value={choice.value}>
            {choice.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OptionSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Switch size="sm" checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}
