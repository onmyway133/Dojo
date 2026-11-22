import { describe, expect, it } from "vitest";
import { analyze, matchUrl, sampleAasa } from "./logic";

const { aasa } = analyze(sampleAasa);

describe("analyze", () => {
  it("accepts the sample", () => {
    expect(analyze(sampleAasa).issues).toEqual([]);
  });

  it("reports bad JSON, missing app IDs and odd app IDs", () => {
    expect(analyze("{").issues[0].level).toBe("error");
    const { issues } = analyze(`{"applinks":{"details":[{"appID":"com.example","paths":["*"]},{"paths":["*"]}]}}`);
    expect(issues.map((i) => i.level)).toEqual(["warning", "error"]);
  });
});

describe("matchUrl", () => {
  const open = (url: string) => matchUrl(aasa!, url).appIDs.length > 0;

  it("follows order, exclusions and wildcards", () => {
    expect(open("https://example.com/products/42")).toBe(true);
    expect(open("https://example.com/help/website/faq")).toBe(false);
    expect(matchUrl(aasa!, "https://example.com/help/website/faq").excludedBy).toHaveLength(1);
    expect(open("https://example.com/about")).toBe(false);
  });

  it("expands substitution variables and query dictionaries", () => {
    expect(open("https://example.com/en_US/pizza/")).toBe(true);
    expect(open("https://example.com/en_US/salad/")).toBe(false);
    expect(open("https://example.com/orders/7?ref=mail")).toBe(true);
    expect(open("https://example.com/orders/7")).toBe(false);
  });

  it("handles legacy paths with NOT", () => {
    const legacy = analyze(`{"applinks":{"apps":[],"details":[{"appID":"ABCDE12345.com.example.app","paths":["NOT /private/*","*"]}]}}`).aasa!;
    expect(matchUrl(legacy, "/private/x").appIDs).toEqual([]);
    expect(matchUrl(legacy, "/public").appIDs).toEqual(["ABCDE12345.com.example.app"]);
  });
});
