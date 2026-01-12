import { gray } from "@std/fmt/colors";
import { getText } from "./src/api.js";
import {
  decode,
  exitRawMode,
  hideTerminalCursor,
  setRawMode,
  showTerminalCursor,
  write,
} from "./src/utils.js";

import { calculateWpmAndAccuracy } from "./src/calculation.js";
import { TypedText } from "./src/typing.js";
import { displayResult, updateScreen } from "./src/render_screen.js";

await setRawMode();

export const typedText = new TypedText();

const TARGET_TEXT = await getText();

const handleBackspace = (decodedChunk, cursorPosition) => {
  if (decodedChunk === "\x7f") {
    if (typedText.length() === 0) return { cursorPosition, toSkip: true };
    typedText.backspace();
    updateScreen(TARGET_TEXT, cursorPosition - 1, "backspace");
    cursorPosition--;
    return { cursorPosition, toSkip: true };
  }

  return { cursorPosition, toSkip: false };
};

const startTypingTest = async () => {
  let cursorPosition = 0;
  let typeCount = 0;
  let mistakeCount = 0;
  let status;

  const startTime = Date.now();

  hideTerminalCursor();

  write(gray(TARGET_TEXT));

  for await (const chunk of Deno.stdin.readable) {
    const decodedChunk = decode(chunk);
    const x = handleBackspace(decodedChunk, cursorPosition);
    cursorPosition = x.cursorPosition;
    if (x.toSkip) {
      continue;
    }

    status = "correct";

    if (TARGET_TEXT[cursorPosition] !== decodedChunk) {
      mistakeCount++;
      status = "mistake";
    }

    await updateScreen(TARGET_TEXT, cursorPosition, status);
    cursorPosition++;

    typeCount++;

    if (cursorPosition >= TARGET_TEXT.length) {
      const endTime = Date.now();
      const timeInMinutes = ((endTime - startTime) / 1000) / 60;
      const speedAndAccurecy = calculateWpmAndAccuracy(
        typeCount,
        timeInMinutes,
        mistakeCount,
      );
      displayResult(speedAndAccurecy);
      showTerminalCursor();
      exitRawMode();
      return;
    }
  }
};

startTypingTest();
