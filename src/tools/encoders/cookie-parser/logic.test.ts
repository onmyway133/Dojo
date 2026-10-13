import { expect, it } from "vitest";
import { expiryOf, parseCookies } from "./logic";

it("parses a Cookie header", () => {
  const result = parseCookies("Cookie: session=abc123; theme=dark; empty=");
  expect(result.source).toBe("cookie-header");
  expect(result.cookies.map((c) => [c.name, c.value])).toEqual([["session", "abc123"], ["theme", "dark"], ["empty", ""]]);
});

it("parses Set-Cookie lines with attributes", () => {
  const result = parseCookies(
    'Set-Cookie: id="a3fWa"; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Secure; HttpOnly; SameSite=Lax\nlang=en; Path=/docs; Max-Age=60',
  );
  expect(result.source).toBe("set-cookie");
  const [id, lang] = result.cookies;
  expect(id).toMatchObject({ name: "id", value: "a3fWa", secure: true, httpOnly: true, sameSite: "Lax" });
  expect(id.expires?.toISOString()).toBe("2026-10-21T07:28:00.000Z");
  expect(lang.path).toBe("/docs");
  expect((expiryOf(lang, 0) as Date).getTime()).toBe(60_000);
});
