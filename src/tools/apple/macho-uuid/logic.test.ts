import { describe, expect, it } from "vitest";
import { findMatch, normalizeUuid } from "./logic";

describe("findMatch", () => {
  const archs = [
    { arch: "x86_64", uuid: "8426AD72-1580-30BD-B8A2-0A05B4672A9F" },
    { arch: "arm64", uuid: "0A5A12D2-1BB8-30D7-A702-5CA628FB27C9" },
  ];

  it("matches crash log style UUIDs", () => {
    expect(findMatch(archs, "<0a5a12d21bb830d7a7025ca628fb27c9>")?.arch).toBe("arm64");
    expect(findMatch(archs, "0a5a12d2")).toBeUndefined();
    expect(normalizeUuid(" 8426AD72-1580 ")).toBe("8426ad721580");
  });
});
