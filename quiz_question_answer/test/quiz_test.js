import { assertEquals } from "jsr:@std/assert";
import { displayQuestion } from "../src/quiz.js";

Deno.test("a simple test", () => {
  const input = 1;
  const output = 1;
  assertEquals(displayQuestion(input), output);
});
