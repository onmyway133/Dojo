import { describe, expect, it } from "vitest";
import { buildPayload, curlCommand, emptyForm, lintPayload, payloadSize } from "./logic";

describe("buildPayload", () => {
  it("builds aps and keeps custom keys next to it", () => {
    const payload = buildPayload(emptyForm);
    expect(payload).toEqual({
      aps: { alert: { title: "Order shipped", body: "Your package is on its way" }, badge: 1, sound: "default" },
      orderId: "42",
    });
    expect(lintPayload(payload, "alert")).toEqual([]);
  });

  it("rejects bad badges and custom JSON", () => {
    expect(() => buildPayload({ ...emptyForm, badge: "x" })).toThrow();
    expect(() => buildPayload({ ...emptyForm, custom: "[1]" })).toThrow();
  });
});

describe("lintPayload", () => {
  it("checks size, unknown aps keys and background rules", () => {
    expect(lintPayload({ aps: { alert: "x".repeat(5000) } }, "alert")[0].level).toBe("error");
    expect(lintPayload({ aps: { alert: "x".repeat(5000) } }, "voip")).toEqual([]);
    expect(lintPayload({ aps: { foo: 1, alert: "hi" } }, "alert")[0].message).toContain("foo");
    expect(lintPayload({ aps: { badge: 1 } }, "background").map((l) => l.level)).toEqual(["error", "warning"]);
  });

  it("counts UTF-8 bytes", () => {
    expect(payloadSize({ a: "é" })).toBe(10);
  });
});

describe("curlCommand", () => {
  it("uses the voip topic and sandbox host", () => {
    const cmd = curlCommand({ aps: {} }, "voip", { topic: "com.example.app", token: "abc", sandbox: true });
    expect(cmd).toContain("apns-topic: com.example.app.voip");
    expect(cmd).toContain("https://api.sandbox.push.apple.com/3/device/abc");
  });
});
