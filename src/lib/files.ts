import { open, save } from "@tauri-apps/plugin-dialog";
import { call } from "./invoke";

export interface FileFilter {
  name: string;
  extensions: string[];
}

export const imageFilter: FileFilter = {
  name: "Images",
  extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff", "tif", "ico", "svg", "heic"],
};

/** Native open panel. Resolves to a path, or undefined when cancelled. */
export async function pickFile(filters?: FileFilter[]): Promise<string | undefined> {
  const path = await open({ multiple: false, directory: false, filters });
  return path ?? undefined;
}

export async function pickFolder(): Promise<string | undefined> {
  const path = await open({ multiple: false, directory: true, canCreateDirectories: true });
  return path ?? undefined;
}

export async function readFileBytes(path: string): Promise<Uint8Array> {
  return new Uint8Array(await call<ArrayBuffer>("read_file", { path }));
}

export const fileInfo = (path: string) => call<{ name: string; size: number }>("file_info", { path });

export const fileName = (path: string) => path.split("/").pop() ?? path;

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Native save panel, then writes the bytes. Resolves to the saved path, or undefined. */
export async function saveBytes(
  bytes: Uint8Array,
  defaultName: string,
  filters?: FileFilter[],
): Promise<string | undefined> {
  const path = await save({ defaultPath: defaultName, filters });
  if (!path) return undefined;
  await call("write_file", { path, base64: bytesToBase64(bytes) });
  return path;
}

const mimeTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
};

export const mimeTypeFor = (path: string) =>
  mimeTypes[path.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
