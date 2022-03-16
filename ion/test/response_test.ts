import { assertExists } from "https://deno.land/std/testing/asserts.ts";
import { IonResponse } from "../server/response.ts";

const res = new IonResponse();

res.headers["content-type"] = "application/json";

Deno.test("# Response headers Getter", () => {
  assertExists(res.headers["content-type"]);
});

Deno.test("# Response headers Getter (uppercase)", () => {
  assertExists(res.headers["Content-Type"]);
});
