import { cardImages } from "./cards_image.js";
import { cards } from "./cards.js";

const displayCards = async (cardCode, cardId) => {
  const url = `https://deckofcardsapi.com/static/img/${cardCode}.png`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const bytes = new Uint8Array(buffer);

  let charCodes = "";
  for (const byte of bytes) {
    charCodes += String.fromCharCode(byte);
  }
  const base64 = btoa(charCodes);
  const ESC = "\x1b";
  const cardImage = ESC + "_G" + `q=2,i=${cardId}` +
    `,a=T,f=100,s=${bytes.length};` + base64 +
    ESC + "\\";
  console.log(cardImage);
};

const showCard = (imageCode, cardId) => {
  const ESC = "\x1b";
  const card = cardImages[imageCode];
  const cardImage = ESC + "_G" + `q=2,i=${cardId}` + ",a=T,f=100;" + card +
    ESC + "\\";
  console.log(cardImage);
};

const clearImage = (cardId) => {
  const ESC = "\x1b";
  const seq = ESC + `_Gq=2,i=${cardId},a=d;` + ESC + "\\";
  console.log(seq);
};

const showAllCards = (cards) => {
  for (const card of cards) {
    showCard(card.imageCode, card.id);
  }
};

showAllCards(cards);
