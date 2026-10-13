import { expect, it } from "vitest";
import { minifyHtml } from "./logic";

it("minifies but keeps pre and script content", () => {
  const html = `<div>\n  <!-- note -->\n  <p>Hello   world</p>\n  <pre>  keep\n   this</pre>\n  <script>if (a  <  b) {}</script>\n</div>`;
  expect(minifyHtml(html)).toBe("<div><p>Hello world</p><pre>  keep\n   this</pre><script>if (a  <  b) {}</script></div>");
});
