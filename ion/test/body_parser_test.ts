import { assertExists } from "https://deno.land/std@0.129.0/testing/asserts.ts";
import { IonBodyParser } from "../server/body_parser.ts";

Deno.test("# Body parse (JSON)", async () => {
  const req = new Request("http://example.com", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ name: "Deno" }),
  });
  const json = new IonBodyParser(req);
  const body = await json.parse();
  assertExists(body?.name);
});
