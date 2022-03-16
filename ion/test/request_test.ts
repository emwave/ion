import {
  assert,
  assertEquals,
  assertExists,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { IonRequest } from "../server/request.ts";

const req = new IonRequest(
  new Request("http://example.com/books/1?orderBy=desc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }),
  new URLPattern({ pathname: "/books/:bookId" }),
);

Deno.test("# Request method", () => {
  assertEquals(req.method, "POST");
});

Deno.test("# Request params", () => {
  assertExists(req.params.bookId);
});

Deno.test("# Request url", () => {
  assert(req.url instanceof URL);
});

Deno.test("# Request headers Setter", () => {
  assertThrows(
    () => {
      req.headers["content-type"] = "application/json";
    },
    TypeError,
  );
});

Deno.test("# Request query Setter", () => {
  assertThrows(
    () => {
      req.query.orderBy = "desc";
    },
    TypeError,
  );
});
