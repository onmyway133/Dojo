import { faker } from "@faker-js/faker/locale/en";
import Papa from "papaparse";

type Value = string | number | boolean;

export interface FieldType {
  id: string;
  label: string;
  /** Shows min and max inputs. */
  range?: boolean;
  make: (field: Field, row: number) => Value;
}

export interface Field {
  name: string;
  type: string;
  min?: number;
  max?: number;
}

export const fieldTypes: FieldType[] = [
  { id: "row", label: "Row number", make: (_, row) => row + 1 },
  { id: "uuid", label: "UUID", make: () => faker.string.uuid() },
  { id: "firstName", label: "First name", make: () => faker.person.firstName() },
  { id: "lastName", label: "Last name", make: () => faker.person.lastName() },
  { id: "fullName", label: "Full name", make: () => faker.person.fullName() },
  { id: "email", label: "Email", make: () => faker.internet.email() },
  { id: "username", label: "Username", make: () => faker.internet.username() },
  { id: "phone", label: "Phone", make: () => faker.phone.number() },
  { id: "company", label: "Company", make: () => faker.company.name() },
  { id: "jobTitle", label: "Job title", make: () => faker.person.jobTitle() },
  { id: "street", label: "Street address", make: () => faker.location.streetAddress() },
  { id: "city", label: "City", make: () => faker.location.city() },
  { id: "country", label: "Country", make: () => faker.location.country() },
  { id: "zip", label: "Zip code", make: () => faker.location.zipCode() },
  { id: "int", label: "Integer", range: true, make: (f) => faker.number.int({ min: f.min ?? 0, max: f.max ?? 100 }) },
  { id: "float", label: "Decimal", range: true, make: (f) => faker.number.float({ min: f.min ?? 0, max: f.max ?? 100, fractionDigits: 2 }) },
  { id: "price", label: "Price", make: () => Number(faker.commerce.price()) },
  { id: "product", label: "Product name", make: () => faker.commerce.productName() },
  { id: "boolean", label: "Boolean", make: () => faker.datatype.boolean() },
  { id: "date", label: "Date", make: () => faker.date.past({ years: 3 }).toISOString().slice(0, 10) },
  { id: "datetime", label: "Date and time", make: () => faker.date.past({ years: 3 }).toISOString() },
  { id: "url", label: "URL", make: () => faker.internet.url() },
  { id: "ipv4", label: "IPv4 address", make: () => faker.internet.ipv4() },
  { id: "color", label: "Hex color", make: () => faker.color.rgb() },
  { id: "word", label: "Word", make: () => faker.lorem.word() },
  { id: "sentence", label: "Sentence", make: () => faker.lorem.sentence() },
  { id: "paragraph", label: "Paragraph", make: () => faker.lorem.paragraph() },
];

const typesById = new Map(fieldTypes.map((t) => [t.id, t]));

export type OutputFormat = "json" | "csv" | "sql";

export interface FakeDataOptions {
  fields: Field[];
  rows: number;
  format: OutputFormat;
  table: string;
  /** Same seed, same data. Empty for random. */
  seed: string;
}

export const MAX_ROWS = 5000;

export const defaultOptions: FakeDataOptions = {
  fields: [
    { name: "id", type: "row" },
    { name: "name", type: "fullName" },
    { name: "email", type: "email" },
    { name: "age", type: "int", min: 18, max: 80 },
    { name: "active", type: "boolean" },
    { name: "created_at", type: "date" },
  ],
  rows: 10,
  format: "json",
  table: "users",
  seed: "",
};

/** A number from any seed text, so words work as seeds too. */
function seedNumber(seed: string): number {
  const n = Number(seed);
  if (Number.isInteger(n)) return n;
  let hash = 0;
  for (const ch of seed) hash = (Math.imul(hash, 31) + ch.charCodeAt(0)) | 0;
  return hash;
}

export function generateRows({ fields, rows, seed }: Pick<FakeDataOptions, "fields" | "rows" | "seed">): Record<string, Value>[] {
  const named = fields.filter((f) => f.name.trim());
  if (named.length === 0) throw new Error("Add at least one field with a name");
  const count = Math.min(Math.max(Math.floor(rows) || 0, 1), MAX_ROWS);
  for (const f of named) if (!typesById.has(f.type)) throw new Error(`Unknown type for ${f.name}`);
  faker.seed(seed.trim() ? seedNumber(seed.trim()) : undefined);
  return Array.from({ length: count }, (_, row) =>
    Object.fromEntries(named.map((f) => [f.name.trim(), typesById.get(f.type)!.make(f, row)])),
  );
}

const quoteIdentifier = (name: string) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : `"${name.replace(/"/g, '""')}"`);

function sqlValue(value: Value): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${value.replace(/'/g, "''")}'`;
}

export function toSql(rows: Record<string, Value>[], table: string): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  const values = rows.map((row) => `  (${columns.map((c) => sqlValue(row[c])).join(", ")})`);
  return `INSERT INTO ${quoteIdentifier(table.trim() || "data")} (${columns.map(quoteIdentifier).join(", ")}) VALUES\n${values.join(",\n")};\n`;
}

export function generate(options: FakeDataOptions): string {
  const rows = generateRows(options);
  switch (options.format) {
    case "json":
      return `${JSON.stringify(rows, null, 2)}\n`;
    case "csv":
      return `${Papa.unparse(rows, { newline: "\n" })}\n`;
    case "sql":
      return toSql(rows, options.table);
  }
}
