import { describe, expect, it } from "vitest";
import { defaultOptions, generate, generateRows, toSql } from "./logic";

describe("generateRows", () => {
  it("is repeatable with a seed", () => {
    const options = { ...defaultOptions, seed: "dojo" };
    expect(generateRows(options)).toEqual(generateRows(options));
    const rows = generateRows(options);
    expect(rows).toHaveLength(10);
    expect(rows[0].id).toBe(1);
    expect(rows.every((r) => (r.age as number) >= 18 && (r.age as number) <= 80)).toBe(true);
  });

  it("needs a named field", () => {
    expect(() => generateRows({ fields: [{ name: " ", type: "email" }], rows: 1, seed: "" })).toThrow();
  });
});

describe("output", () => {
  it("writes SQL inserts with escaped strings", () => {
    expect(toSql([{ id: 1, name: "O'Brien", ok: true }], "people")).toBe(
      "INSERT INTO people (id, name, ok) VALUES\n  (1, 'O''Brien', TRUE);\n",
    );
  });

  it("writes CSV with a header", () => {
    const csv = generate({ ...defaultOptions, rows: 2, format: "csv", seed: "1" });
    expect(csv.split("\n")[0]).toBe("id,name,email,age,active,created_at");
  });
});
