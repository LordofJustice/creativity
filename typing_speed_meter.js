import { brightGreen, brightRed, gray } from "@std/fmt/colors";

const sentence = "hello world i am here";

await Deno.stdin.setRaw(true, { cbreak: true });

const decode = (encodedText) => new TextDecoder().decode(encodedText);
const encode = (text) => new TextEncoder().encode(text);

const write = async (text) => {
  const encodedText = encode(text);
  await Deno.stdout.write(encodedText);
};

const calSpeedAndAccurecy = (typeCount, timeInMinutes, errorCount) => {
  const WPM = (typeCount / 5) / timeInMinutes;
  const Accuracy = Math.round(
    ((typeCount - errorCount) / typeCount) * 100,
    3,
  );
  return { WPM, Accuracy };
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
}

const preTexts = new PreviousText();

const updateScreen = async (sentence, cursor, isMistake) => {
  const letter = isMistake
    ? brightRed(sentence[cursor])
    : brightGreen(sentence[cursor]);
  const text = preTexts.previousText() + letter +
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
  let isMistake = false;

  const startTime = Date.now();

  console.clear();
  write(gray(sentence));
  for await (const chunk of Deno.stdin.readable) {
    const decodedChunk = decode(chunk);
    console.clear();
    isMistake = false;

    if (sentence[cursor] !== decodedChunk) {
      errorCount++;
      isMistake = true;
    }

    await updateScreen(sentence, cursor, isMistake);
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
      return;
    }

    typeCount++;
  }
};

startTypingTest();
