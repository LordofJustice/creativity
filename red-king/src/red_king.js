import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";
import { escSeqOfImage } from "./display_cards.js";
const CARD_WIDTH_OFFSET = 12;
const CARD_HEIGHT_OFFSET = 8;
const PLAYERS_COUNT = 4;
const SCREEN_CLEAR = "\x1b[2J\x1b[H";

const moveCursorTo = (x, y) => `\x1b[${y};${x}H`;

const encode = (text) => new TextEncoder().encode(text);

const decode = (arrBuffer) => new TextDecoder().decode(arrBuffer);

const distributeCards = (distributeCard, players) => {
  for (const player of players) {
    player.cards.push(
      distributeCard.next().value,
      distributeCard.next().value,
      distributeCard.next().value,
      distributeCard.next().value,
    );
  }
  return players;
};

const writeOnConnection = async (conn, content) => {
  await conn.write(encode(content));
};

const displayCard = async (
  conn,
  imageCode,
  id,
  { x, y },
  toShowFace = false,
) => {
  await writeOnConnection(conn, moveCursorTo(x, y));

  const toShow = toShowFace ? imageCode.trim().toUpperCase() : "BACK";
  const image = escSeqOfImage(toShow, id);
  await writeOnConnection(conn, image);
};

const displayCards = async (
  currentPlayer,
  players,
  showEveryOneCards = false,
) => {
  await writeOnConnection(currentPlayer.conn, SCREEN_CLEAR);
  const cardPos = { x: 0, y: 0 };
  const toShow = true;
  for (const card of currentPlayer.cards) {
    await displayCard(
      currentPlayer.conn,
      card.imageCode,
      card.id,
      cardPos,
      toShow,
    );
    cardPos.x += CARD_WIDTH_OFFSET;
  }

  cardPos.y += 2;

  const otherPlayers = players.filter((each) => each !== currentPlayer);

  for (const player of otherPlayers) {
    cardPos.y += CARD_HEIGHT_OFFSET;
    cardPos.x = 0;
    for (const card of player.cards) {
      await displayCard(
        currentPlayer.conn,
        card.imageCode,
        card.id,
        cardPos,
        showEveryOneCards,
      );
      cardPos.x += CARD_WIDTH_OFFSET;
    }
  }
};

const drawCard = function* (cards) {
  while (cards.length !== 0) {
    yield cards.pop();
  }
};

const dbg = (massage, x) => {
  console.log({ [massage]: x });
  return x;
};

const delay = async (time) => {
  await new Promise((resolve, reject) => {
    setInterval(() => {
      resolve(1);
    }, time);
  });
};

export const startGameServer = async (port) => {
  const server = Deno.listen({
    hostname: "10.132.124.208",
    port,
    transport: "tcp",
  });
  const shuffledCards = shuffle(cards);
  const cardDistributor = drawCard(shuffledCards);
  const players = [];

  for await (const conn of server) {
    players.push({ conn, cards: [] });
    writeOnConnection(conn, "Waiting for players....");

    broadcast(players);
    if (players.length === PLAYERS_COUNT) {
      break;
    }
  }

  distributeCards(cardDistributor, players);

  while (true) {
    for (const player of players) {
      await displayCards(player, players);
    }
    await delay(300);
  }
};

const broadcast = (players) => {
  players.forEach(async ({ conn }) => {
    await writeOnConnection(
      conn,
      `\n\nWaiting for players....\nConnected : ${players.length}`,
    );
  });
};
// 10.132.124.208
