import { expect, it } from "vitest";
import { extract } from "./logic";

const text = `Mail ada@example.com or grace@navy.mil (see https://example.com/a_(b)). Ping @ada.
Hosts: 10.0.0.1, 192.168.1.256, ::1 and 2001:db8::8a2e:370:7334, time 12:30:45.
Theme #0a84ff and #fff, tags #swift #12345 #ios17. Totals: 3, -4.5, 1e3, v1.2.3`;

const o = { unique: true, sort: false };

it("extracts emails, urls and mentions", () => {
  expect(extract(text, "emails", o)).toEqual(["ada@example.com", "grace@navy.mil"]);
  expect(extract(text, "urls", o)).toEqual(["https://example.com/a_(b)"]);
  expect(extract(text, "mentions", o)).toEqual(["@ada"]);
});

it("extracts valid IP addresses only", () => {
  expect(extract(text, "ipv4", o)).toEqual(["10.0.0.1"]);
  expect(extract(text, "ipv6", o)).toEqual(["::1", "2001:db8::8a2e:370:7334"]);
});

it("extracts colors, hashtags and numbers", () => {
  expect(extract(text, "hexColors", o)).toEqual(["#0a84ff", "#fff"]);
  expect(extract(text, "hashtags", o)).toEqual(["#swift", "#ios17"]);
  expect(extract("3, -4.5, 1e3 and 3", "numbers", { unique: true, sort: true })).toEqual(["-4.5", "3", "1e3"]);
});
