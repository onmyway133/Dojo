import { Hash } from "lucide-react";
import { defineTool } from "@/tools/types";

export const meta = defineTool({
  id: "hash",
  name: "Hash Generator",
  description: "MD5, SHA-1, SHA-2 and SHA-3 digests of text",
  category: "generators",
  icon: Hash,
  keywords: ["md5", "sha1", "sha256", "sha512", "sha3", "digest", "checksum"],
});
