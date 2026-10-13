export interface UrlParts {
  url: URL;
  params: [string, string][];
}

export function parseUrl(input: string): UrlParts {
  const trimmed = input.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Not a valid absolute URL (include the scheme, e.g. https://)");
  }
  return { url, params: [...url.searchParams.entries()] };
}

/** Returns the URL with its query replaced by `params`, keeping everything else. */
export function withParams(input: string, params: [string, string][]): string {
  const url = new URL(input.trim());
  url.search = new URLSearchParams(params.filter(([key]) => key !== "")).toString();
  return url.toString();
}
