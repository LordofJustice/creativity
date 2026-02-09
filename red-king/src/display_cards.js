import { delay } from "./red_king_lib.js";
import { cardImages } from "./cards_image.js";
import { writeOnConnection } from "./red_king_lib.js";

const CARD_WIDTH_OFFSET = 12;
const CARD_HEIGHT_OFFSET = 8;
const DELAY_BETWEEN_CARD_TRANSFER = 15;
const SCREEN_CLEAR = "\x1b[2J\x1b[H";
const BACK_CARD = "BACK_GOLD";

const moveCursorTo = (x, y) => `\x1b[${y};${x}H`;

export const escSeqOfImage = (imageCode, cardId) => {
  const ESC = "\x1b";
  const card = cardImages[imageCode];
  const cardImage = ESC + "_G" + `q=2,i=${cardId}` +
    `,a=T,f=100;` + card +
    ESC + "\\";
  return cardImage;
};

export const displayCard = async (
  conn,
  imageCode,
  id,
  { x, y },
  toShowFace = false,
  moveCursor = true,
) => {
  const toShow = toShowFace ? imageCode.trim().toUpperCase() : BACK_CARD;
  const image = escSeqOfImage(toShow, id);
  const move = moveCursor ? moveCursorTo(x, y) : "";
  await writeOnConnection(conn, move + image + "\n");
  await delay(DELAY_BETWEEN_CARD_TRANSFER);
};

const showPlayerCards = async (conn, cards, cardPos, showFace = false) => {
  for (const card of cards) {
    if (card !== null) {
      await displayCard(
        conn,
        card.imageCode,
        card.id,
        cardPos,
        showFace,
      );
    }
    cardPos.x += CARD_WIDTH_OFFSET;
  }
  cardPos.x = 1;
};

const displayDiscardedCard = async (conn, discardedCard, cardPos) => {
  cardPos.y += CARD_HEIGHT_OFFSET;
  await writeOnConnection(conn, "DISCARDED CARD");
  await displayCard(
    conn,
    discardedCard.imageCode,
    discardedCard.id,
    cardPos,
    true,
  );
  await writeOnConnection(
    conn,
    moveCursorTo(0, cardPos.y + CARD_HEIGHT_OFFSET),
  );
};

const showOtherPlayerCards = async (otherPlayers, cardPos, currentPlayer) => {
  for (const player of otherPlayers) {
    cardPos.y += CARD_HEIGHT_OFFSET;

    await writeOnConnection(
      currentPlayer.conn,
      `Player : ${player.name} [${player.id}]`,
    );
    await showPlayerCards(currentPlayer.conn, player.cards, cardPos, false);
  }
};

export const displayCards = async (currentPlayer, players, discardedCard) => {
  await writeOnConnection(currentPlayer.conn, SCREEN_CLEAR);
  const cardPos = { x: 1, y: 2 }; //terminal grid starts from 1,1

  await writeOnConnection(
    currentPlayer.conn,
    `Hello Player : ${currentPlayer.name} [${currentPlayer.id}]`,
  );
  await showPlayerCards(currentPlayer.conn, currentPlayer.cards, cardPos);

  const otherPlayers = players.filter((player) => player !== currentPlayer);
  await showOtherPlayerCards(otherPlayers, cardPos, currentPlayer);
  await displayDiscardedCard(currentPlayer.conn, discardedCard, cardPos);
};
