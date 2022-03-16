import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { IonEventEmitter } from "../internals/event_emitter.ts";

const ee = new IonEventEmitter();

Deno.test("# Event Emitter dispatch", () => {
  ee.on("foo", (x: any) => assertEquals(x, 10));
  ee.dispatch("foo", 10);
});
