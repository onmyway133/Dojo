import db from "mime-db";
import { expect, it } from "vitest";
import { mimeList, searchMime } from "./logic";

const list = mimeList(db);

it("finds types by extension and by name", () => {
  expect(searchMime(list, ".png")[0].type).toBe("image/png");
  expect(searchMime(list, "report.pdf")[0].type).toBe("application/pdf");
  expect(searchMime(list, "application/json")[0].type).toBe("application/json");
});
