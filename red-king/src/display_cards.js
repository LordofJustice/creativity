import { cardImages } from "./cards_image.js";
import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";
// import { process } from "node:process";

const encode = (text) => new TextEncoder().encode(text);

export const escSeqOfImage = (imageCode, cardId) => {
  const ESC = "\x1b";
  const card = cardImages[imageCode];
  const cardImage = ESC + "_G" + `q=2,i=${cardId}` +
    `,a=T,f=100;` + card +
    ESC + "\\";
  return cardImage;
};

export const showCard = async (
  destination = Deno.stdout,
  imageCode,
  cardId,
  x,
  y,
) => {
  const card = cardImages[imageCode];
  const cardImage = ESC + "_G" + `q=2,i=${cardId}` +
    `,a=T,f=100;` + card +
    ESC + "\\";
  // await destination.write(encode(`\x1b[${x};${y}H`));
  // await destination.write(encode(cardImage));
};

const card = `
⎡‾⎺

`;

const clearImage = (cardId) => {
  const ESC = "\x1b";
  const seq = ESC + `_Gq=2,i=${cardId},a=d;` + ESC + "\\";
  console.log(seq);
  console.clear();
};

const cardShufflingAnimation = async (cards, animationTime, frameRate) => {
  let stop = false;
  await Deno.stdout.write(encode(ESC + "[?25l"));
  setTimeout(async () => {
    stop = true;
    await Deno.stdout.write(encode(ESC + "[?25l"));
  }, animationTime);

  const code = setInterval(async () => {
    const newCards = shuffle(cards);
    clearImage(1);
    await showCard(newCards[0].imageCode, newCards[0].id, 0, 0);
    await showCard(newCards[1].imageCode, newCards[1].id, 0, 9);
    await showCard(newCards[2].imageCode, newCards[2].id, 6, 0);
    await showCard(newCards[3].imageCode, newCards[3].id, 6, 9);
    await showCard("BACK", 100, 6, 18);
    if (stop) clearInterval(code);
  }, frameRate);
};

// await cardShufflingAnimation(cards, 3000, 80);
