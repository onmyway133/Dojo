import { expect, it } from "vitest";
import { validate } from "./logic";

const schema = JSON.stringify({
  type: "object",
  required: ["email", "age"],
  properties: { email: { type: "string", format: "email" }, age: { type: "integer", minimum: 0 } },
});

it("reports every error with its path", () => {
  expect(validate('{"email":"a@b.co","age":3}', schema)).toEqual({ status: "valid" });
  const result = validate('{"email":"nope","age":-1}', schema);
  expect(result.status).toBe("invalid");
  if (result.status === "invalid") expect(result.errors.map((e) => e.path)).toEqual(["/email", "/age"]);
  expect(validate("{}", "{").status).toBe("error");
});
