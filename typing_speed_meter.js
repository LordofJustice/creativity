import { brightGreen, brightRed, gray } from "@std/fmt/colors";

const sentence =
  'Two common terms used to describe a salesperson are "Farmer" and "Hunter". The reality is that most professional salespeople have a little of both.';

const CURSOR = "|";

const calSpeedAndAccurecy = (typeCount, timeInMinutes, errorCount) => {
  const WPM = (typeCount / 5) / timeInMinutes;
  const Accuracy = Math.round(
    ((typeCount - errorCount) / typeCount) * 100,
    3,
  );
  return { WPM, Accuracy };
};

await Deno.stdin.setRaw(true, { cbreak: true });

const decode = (encodedText) => new TextDecoder().decode(encodedText);
const encode = (text) => new TextEncoder().encode(text);

const write = async (text) => {
  console.clear();
  const encodedText = encode(text);
  await Deno.stdout.write(encodedText);
};

class PreviousText {
  #text;
  constructor() {
    this.#text = [];
  }
  add(newText) {
    this.#text.push(newText);
  }
  previousText() {
    return this.#text.join("");
  }
  lenght() {
    return this.#text.length;
  }
  backspace() {
    this.#text.pop();
  }
}

const preTexts = new PreviousText();

const textColour = {
  "mistake": brightRed,
  "correct": brightGreen,
};

const updateScreen = async (sentence, cursor, status) => {
  if (status === "backspace") {
    const text = preTexts.previousText() + CURSOR +
      gray(sentence.slice(cursor));
    await write(text);
    return;
  }
  const letter = textColour[status](sentence[cursor]);
  const text = preTexts.previousText() + letter + CURSOR +
    gray(sentence.slice(cursor + 1));
  preTexts.add(letter);
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
  let cursor = 0;
  let typeCount = 0;
  let errorCount = 0;
  let status;

  const startTime = Date.now();

  write(gray(sentence));

  for await (const chunk of Deno.stdin.readable) {
    const decodedChunk = decode(chunk);
    if (decodedChunk === "\x7f") {
      if (preTexts.lenght() === 0) continue;
      preTexts.backspace();
      updateScreen(sentence, cursor - 1, "backspace");
      cursor--;
      continue;
    }

    status = "correct";

    if (sentence[cursor] !== decodedChunk) {
      errorCount++;
      status = "mistake";
    }

    await updateScreen(sentence, cursor, status);
    cursor++;

    if (cursor >= sentence.length) {
      const endTime = Date.now();
      const timeInMinutes = ((endTime - startTime) / 1000) / 60;
      const speedAndAccurecy = calSpeedAndAccurecy(
        typeCount,
        timeInMinutes,
        errorCount,
      );
      displayResult(speedAndAccurecy);
      break;
    }

    typeCount++;
  }
};

startTypingTest();
