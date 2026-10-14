export interface PlaceholderOptions {
  width: number;
  height: number;
  background: string;
  foreground: string;
  /** Empty means "<width> × <height>". */
  text: string;
  fontSize: number;
}

const escapeXml = (value: string) =>
  value.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

export function placeholderSvg({ width, height, background, foreground, text, fontSize }: PlaceholderOptions): string {
  if (!(width > 0 && height > 0)) throw new Error("Width and height must be positive");
  const label = escapeXml(text || `${width} × ${height}`);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="${escapeXml(background)}"/>`,
    `<text x="50%" y="50%" fill="${escapeXml(foreground)}" font-family="-apple-system, system-ui, sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${label}</text>`,
    `</svg>`,
  ].join("");
}

/** Percent-encoded data URI, smaller than base64 for SVG and usable in CSS `url()`. */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg).replace(/%20/g, " ").replace(/%3D/g, "=").replace(/%3A/g, ":").replace(/%2F/g, "/")}`;
}

/** A font size that fits the default label comfortably. */
export const defaultFontSize = (width: number, height: number) => Math.max(10, Math.round(Math.min(width / 8, height / 3)));
