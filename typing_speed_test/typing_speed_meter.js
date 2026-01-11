import { brightGreen, brightRed, gray } from "@std/fmt/colors";

const getText = async () => {
  try {
    const url = "https://en.wikipedia.org/api/rest_v1/page/random/summary";
    const response = await fetch(url);
    if (!response.ok) throw "Bad URL Response";
    const data = await response.json();
    return data.extract;
  } catch (err) {
    console.log(`ERROR : ${err}`);
    showTerminalCursor();
    Deno.exit(1);
  }
};

const TARGET_TEXT = await getText();

const write = async (text) => {
  console.clear();
  const encodedText = encode(text);
  await Deno.stdout.write(encodedText);
};

const hideTerminalCursor = () => Deno.stdout.writeSync(encode("\x1B[?25l"));

const showTerminalCursor = () => Deno.stdout.writeSync(encode("\x1B[?25h"));

const CURSOR_CHAR = "|";

const calculateWpmAndAccuracy = (typeCount, timeInMinutes, errorCount) => {
  const WPM = ((typeCount / 5) / timeInMinutes).toPrecision(4);
  const Accuracy = (((typeCount - errorCount) / typeCount) * 100)
    .toPrecision(3);
  return { WPM, Accuracy };
};

await Deno.stdin.setRaw(true, { cbreak: true });

const decode = (encodedText) => new TextDecoder().decode(encodedText);

const encode = (text) => new TextEncoder().encode(text);

class TypedText {
  #text;
  constructor() {
    this.#text = [];
  }
  append(newText) {
    this.#text.push(newText);
  }
  toString() {
    return this.#text.join("");
  }
  length() {
    return this.#text.length;
  }
  backspace() {
    this.#text.pop();
  }
}

const typedText = new TypedText();

const COLOUR_BY_STATUS = {
  "mistake": brightRed,
  "correct": brightGreen,
};

const updateScreen = async (paragraph, cursor, status) => {
  if (status === "backspace") {
    const text = typedText.toString() + CURSOR_CHAR +
      gray(paragraph.slice(cursor));
    await write(text);
    return;
  }
  const letter = COLOUR_BY_STATUS[status](paragraph[cursor]);
  const text = typedText.toString() + letter + CURSOR_CHAR +
    gray(paragraph.slice(cursor + 1));
  typedText.append(letter);
  await write(text);
};

const displayResult = ({ WPM, Accuracy }) => {
  const message = `
  -----------------------------------
    Word Per Minute : ${WPM}       
    Accuracy        : ${Accuracy}%         
  -----------------------------------`;
  console.log("\n", message);
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
    if (decodedChunk === "\x7f") {
      if (typedText.length() === 0) continue;
      typedText.backspace();
      updateScreen(TARGET_TEXT, cursorPosition - 1, "backspace");
      cursorPosition--;
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
      return;
    }
  }
};

startTypingTest();
