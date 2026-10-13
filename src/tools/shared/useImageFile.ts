import { useEffect, useState } from "react";
import { readFileBytes } from "@/lib/files";
import { call } from "@/lib/invoke";

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/** A picked image file: its path, decoded info (from Rust) and a preview URL. */
export function useImageFile() {
  const [path, setPath] = useState<string>();
  const [info, setInfo] = useState<ImageInfo>();
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!path) return;
    let url: string | undefined;
    let cancelled = false;
    setError(undefined);
    Promise.all([call<ImageInfo>("image_info", { path }), readFileBytes(path)])
      .then(([imageInfo, bytes]) => {
        if (cancelled) return;
        url = URL.createObjectURL(new Blob([bytes as BlobPart]));
        setInfo(imageInfo);
        setPreview(url);
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [path]);

  return { path, setPath, info, preview, error };
}

export interface WriteResult {
  width: number;
  height: number;
  bytesBefore: number;
  bytesAfter: number;
}
