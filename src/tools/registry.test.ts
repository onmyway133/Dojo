import { Braces } from "lucide-react";
import { describe, expect, it } from "vitest";
import { searchTools } from "./registry";
import type { ToolMeta } from "./types";

const tool = (id: string, name: string, keywords?: string[]): ToolMeta => ({
  id,
  name,
  description: "",
  category: "formatters",
  icon: Braces,
  keywords,
});

describe("searchTools", () => {
  const list = [tool("json-formatter", "JSON Formatter", ["beautify"]), tool("hash", "Hash")];

  it("returns everything for an empty query", () => {
    expect(searchTools(list, "  ")).toHaveLength(2);
  });

  it("matches keywords and requires every word", () => {
    expect(searchTools(list, "beautify json").map((t) => t.id)).toEqual(["json-formatter"]);
    expect(searchTools(list, "beautify hash")).toEqual([]);
  });
});
