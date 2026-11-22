import { describe, expect, it } from "vitest";
import { entitlementNotes, expiryStatus } from "./logic";

describe("expiryStatus", () => {
  const now = 1_000_000;
  it("flags expired, soon and valid", () => {
    expect(expiryStatus(now - 86_400 * 3, now)?.tone).toBe("error");
    expect(expiryStatus(now + 86_400 * 10, now)).toEqual({ tone: "warning", label: "Expires in 10 days" });
    expect(expiryStatus(now + 86_400 * 100, now)?.tone).toBe("ok");
    expect(expiryStatus(undefined, now)).toBeUndefined();
  });
});

describe("entitlementNotes", () => {
  it("calls out debug builds, push environment and wildcards", () => {
    const notes = entitlementNotes({
      "get-task-allow": true,
      "aps-environment": "development",
      "keychain-access-groups": ["ABCDE12345.*"],
    });
    expect(notes).toHaveLength(3);
    expect(notes[2]).toContain("keychain-access-groups");
  });
});
