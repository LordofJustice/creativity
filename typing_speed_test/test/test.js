import { assertEquals } from "jsr:@std/assert";
import { main } from "../src/main.js";

Deno.test("a simple test", () => {
  const input = main();
  const output = 1;
  assertEquals(input, output);
});
