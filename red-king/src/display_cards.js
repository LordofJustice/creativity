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
  toMove = true,
) => {
  const toShow = toShowFace ? imageCode.trim().toUpperCase() : BACK_CARD;
  const image = escSeqOfImage(toShow, id);
  const move = toMove ? moveCursorTo(x, y) : "";
  await writeOnConnection(conn, move + image + "\n");
  await delay(DELAY_BETWEEN_CARD_TRANSFER);
};

export const displayCards = async (currentPlayer, players, discardedCard) => {
  await writeOnConnection(currentPlayer.conn, SCREEN_CLEAR);
  const cardPos = { x: 0, y: 2 };
  const showFace = false;

  await writeOnConnection(
    currentPlayer.conn,
    `Hello Player : ${currentPlayer.name} [${currentPlayer.id}]`,
  );

  for (const card of currentPlayer.cards) {
    if (card !== null) {
      await displayCard(
        currentPlayer.conn,
        card.imageCode,
        card.id,
        cardPos,
        showFace,
      );
    }
    cardPos.x += CARD_WIDTH_OFFSET;
  }

  cardPos.y += 2;

  const otherPlayers = players.filter((each) => each !== currentPlayer);

  let pad = "\n\n";
  for (const player of otherPlayers) {
    cardPos.y += CARD_HEIGHT_OFFSET;
    cardPos.x = 0;

    await writeOnConnection(
      currentPlayer.conn,
      `${pad}Player : ${player.name} [${player.id}]`,
    );
    pad = "\n";
    for (const card of player.cards) {
      if (card !== null) {
        await displayCard(
          currentPlayer.conn,
          card.imageCode,
          card.id,
          cardPos,
        );
      }
      cardPos.x += CARD_WIDTH_OFFSET;
    }
    cardPos.x = 0;
    cardPos.y += CARD_HEIGHT_OFFSET;
    await displayCard(
      currentPlayer.conn,
      discardedCard.imageCode,
      discardedCard.id,
      cardPos,
      true,
    );
    await writeOnConnection(
      currentPlayer.conn,
      moveCursorTo(0, cardPos.y + CARD_HEIGHT_OFFSET),
    );
  }
};
