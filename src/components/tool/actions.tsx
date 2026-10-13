import { Check, ClipboardPaste, Copy, Eraser, FileInput, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { copyText, readText } from "@/lib/clipboard";
import { IconAction } from "./IconAction";

/** Copies a value; shows a checkmark for a moment. Accepts a getter for lazy values. */
export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string | (() => string);
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    const text = typeof value === "function" ? value() : value;
    if (!text) return;
    try {
      await copyText(text);
      setCopied(true);
    } catch (error) {
      toast.error("Couldn't copy", { description: String(error) });
    }
  }

  const empty = typeof value === "string" && value.length === 0;
  return (
    <IconAction label={copied ? "Copied" : label} onClick={copy} disabled={empty}>
      {copied ? <Check className="text-success" /> : <Copy />}
    </IconAction>
  );
}

export function PasteButton({ onPaste }: { onPaste: (text: string) => void }) {
  async function paste() {
    try {
      onPaste(await readText());
    } catch (error) {
      toast.error("Couldn't read the clipboard", { description: String(error) });
    }
  }
  return (
    <IconAction label="Paste" onClick={paste}>
      <ClipboardPaste />
    </IconAction>
  );
}

export function ClearButton({ onClear, disabled }: { onClear: () => void; disabled?: boolean }) {
  return (
    <IconAction label="Clear" onClick={onClear} disabled={disabled}>
      <Eraser />
    </IconAction>
  );
}

export function SampleButton({ onSample }: { onSample: () => void }) {
  return (
    <IconAction label="Load Sample" onClick={onSample}>
      <Sparkles />
    </IconAction>
  );
}

/** Opens a text file from disk through the browser file picker. */
export function OpenTextFileButton({
  onOpen,
  accept,
}: {
  onOpen: (text: string, file: File) => void;
  accept?: string;
}) {
  function open() {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) onOpen(await file.text(), file);
    };
    input.click();
  }
  return (
    <IconAction label="Open File" onClick={open}>
      <FileInput />
    </IconAction>
  );
}

/** The standard trio for an input section: paste, sample (optional) and clear. */
export function InputActions({
  value,
  onChange,
  sample,
}: {
  value: string;
  onChange: (value: string) => void;
  sample?: string;
}) {
  return (
    <>
      <PasteButton onPaste={onChange} />
      {sample !== undefined && <SampleButton onSample={() => onChange(sample)} />}
      <ClearButton onClear={() => onChange("")} disabled={!value} />
    </>
  );
}
