import { parseAllDocuments } from "yaml";

/** Re-serialises every document in the stream, keeping comments. */
export function formatYaml(input: string, indent: number): string {
  const docs = parseAllDocuments(input);
  const docList = Array.isArray(docs) ? docs : [docs];
  for (const doc of docList) {
    if (doc.errors.length > 0) throw new Error(doc.errors[0].message);
  }
  // Documents after the first keep their own "---" marker when serialised.
  return docList.map((doc) => doc.toString({ indent })).join("");
}
