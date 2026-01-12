import { typedText } from "../typing_speed_meter.js";
import { brightGreen, brightRed, gray } from "@std/fmt/colors";
import { write } from "./utils.js";
const CURSOR_CHAR = "|";

const COLOUR_BY_STATUS = {
  "mistake": brightRed,
  "correct": brightGreen,
};

export const updateScreen = async (paragraph, cursor, status) => {
  if (status === "backspace") {
    const text = typedText.toString() +
      CURSOR_CHAR +
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

export const displayResult = ({ WPM, Accuracy }) => {
  const message = `
  -----------------------------------
    Word Per Minute : ${WPM}       
    Accuracy        : ${Accuracy}%         
  -----------------------------------`;
  console.log("\n", message);
};
