import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useHotkey } from "@/hooks/useHotkey";
import { inTauri } from "@/lib/platform";
import { useCommandMenu } from "@/stores/commandMenu";
import { groupByCategory, tools } from "@/tools/registry";

/** ⌘K palette to jump to any tool from the keyboard. */
export function CommandMenu() {
  const open = useCommandMenu((s) => s.open);
  const setOpen = useCommandMenu((s) => s.setOpen);
  const navigate = useNavigate();

  // In the app the View menu owns ⌘K; this covers the browser during development.
  useHotkey({ key: "k", meta: true }, () => setOpen(!open), !inTauri);

  function openTool(id: string) {
    setOpen(false);
    navigate(`/tools/${id}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Open Tool" description="Search for a tool">
      <CommandInput placeholder="Open a tool…" />
      <CommandList>
        <CommandEmpty>No tools found.</CommandEmpty>
        {groupByCategory(tools).map(({ category, tools: groupTools }) => (
          <CommandGroup key={category.id} heading={category.name}>
            {groupTools.map((tool) => (
              <CommandItem
                key={tool.id}
                value={`${tool.name} ${tool.keywords?.join(" ") ?? ""} ${tool.id}`}
                onSelect={() => openTool(tool.id)}
              >
                <tool.icon className="text-primary" />
                <span>{tool.name}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{tool.description}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
