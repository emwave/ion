import {
  assertEquals,
  assertExists,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { IonServer } from "../server/server.ts";

const s = new IonServer();
s.refs.x = 42;

Deno.test("# Sever default host", () => {
  assertEquals(s.options?.host, "0.0.0.0");
});

Deno.test("# Sever default port", () => {
  assertEquals(s.options?.port, 8080);
});

Deno.test("# Sever custom host", () => {
  const s = new IonServer({ host: "127.0.0.1" });
  assertEquals(s.options?.host, "127.0.0.1");
});

Deno.test("# Sever custom port", () => {
  const s = new IonServer({ port: 3000 });
  assertEquals(s.options?.port, 3000);
});

Deno.test("# Sever route definition", () => {
  s.on("OPTIONS /", () => null);
  assertEquals(s.isMethodDefined("OPTIONS"), true);
});

Deno.test("# Sever route match", () => {
  s.on("GET /books/:id", () => null);
  const req = new Request("http://example.com/books/1");
  const url = new URL(req.url);
  const pattern = new URLPattern({ pathname: url.pathname });
  assertEquals(s.isRouteMatch(pattern, req.url), true);
});

Deno.test("# Sever refs", () => {
  assertExists(s.refs.x);
});

Deno.test("# Request query Setter", () => {
  assertThrows(
    () => {
      s.refs.x = 42;
    },
    TypeError,
  );
});
