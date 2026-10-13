import { expect, it } from "vitest";
import { bump, checkRange, compareVersions, parseVersion } from "./logic";

it("parses, bumps, compares and checks ranges", () => {
  expect(parseVersion("v1.4.0-beta.2+exp.sha")).toMatchObject({ major: 1, minor: 4, prerelease: "beta.2", build: "exp.sha" });
  expect(bump("1.4.0", "minor", "")).toBe("1.5.0");
  expect(bump("1.4.0", "prerelease", "rc")).toBe("1.4.1-rc.0");
  expect(compareVersions("1.10.0", "1.9.9")).toBe(">");
  expect(checkRange("1.8.3", "^1.2")).toMatchObject({ valid: true, satisfies: true, normalized: ">=1.2.0 <2.0.0-0" });
  expect(checkRange("1.0.0", "nope").valid).toBe(false);
});
