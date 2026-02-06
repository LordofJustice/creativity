import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";
import { escSeqOfImage } from "./display_cards.js";
const CARD_WIDTH_OFFSET = 12;
const CARD_HEIGHT_OFFSET = 8;
const PLAYERS_COUNT = 3;
const CARDS_TO_DISTRIBUTE = 10;
const DELAY_BETWEEN_CARD_TRANSFER = 5;
const SCREEN_CLEAR = "\x1b[2J\x1b[H";

const moveCursorTo = (x, y) => `\x1b[${y};${x}H`;

const encode = (text) => new TextEncoder().encode(text);

const decode = (arrBuffer) => new TextDecoder().decode(arrBuffer);

const distributeCards = (distributeCard, players) => {
  for (const player of players) {
    for (let i = 0; i < CARDS_TO_DISTRIBUTE; i++) {
      player.cards.push(distributeCard.next().value);
    }
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
  const toShow = toShowFace ? imageCode.trim().toUpperCase() : "BACK";
  const image = escSeqOfImage(toShow, id);
  await writeOnConnection(conn, moveCursorTo(x, y) + image);
  await delay(DELAY_BETWEEN_CARD_TRANSFER);
};

const displayCards = async (
  currentPlayer,
  players,
  showEveryOneCards = false,
) => {
  await writeOnConnection(currentPlayer.conn, SCREEN_CLEAR);
  const cardPos = { x: 0, y: 2 };
  const toShow = true;
  writeOnConnection(
    currentPlayer.conn,
    `Hello Player : ${currentPlayer.name} ${currentPlayer.id}`,
  );
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

  let pad = "\n\n\n\n";
  for (const player of otherPlayers) {
    cardPos.y += CARD_HEIGHT_OFFSET;
    cardPos.x = 0;
    writeOnConnection(
      currentPlayer.conn,
      `${pad}Player : ${player.name} [${player.id}]`,
    );
    pad = "\n";
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
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

export const startGameServer = async (port, hostname) => {
  const server = Deno.listen({
    hostname,
    port,
    transport: "tcp",
  });
  const shuffledCards = shuffle(cards);
  const cardDistributor = drawCard(shuffledCards);
  const players = [];
  let i = 523123;
  for await (const conn of server) {
    // writeOnConnection(conn, `Hello player [${i - 1}] \nEnter Your Name : `);
    const player = { conn, cards: [] };
    const name = await takeInput(
      conn,
      `\n\n\nEnter Your Name [player Id : ${i}] :`,
    );

    player.id = i++;
    player.name = name;

    players.push(player);

    broadcast(
      players,
      `\n\nWaiting for players....\nConnected : ${players.length}`,
    );
    if (players.length === PLAYERS_COUNT) {
      break;
    }
  }

  distributeCards(cardDistributor, players);

  const mostPrioritizedOne = null;
  let chance = 0;
  while (true) {
    for (const player of players) {
      await displayCards(player, players, player === mostPrioritizedOne);
    }

    const won = players.find((each) => each.cards.length === 0);
    if (won) {
      broadcast(players, `\n\n?********   Player ${won.id} Has Won!  *******`);
      break;
    }

    // const player = Math.floor(Math.random() * players.length);

    // players[player].cards.pop();
    const player = players[chance];

    broadcast(
      players,
      ` \n\n Now player ${player.name} [${player.id}] will Play!\n`,
    );

    const data = await takeInput(
      player.conn,
      `\n\nPlayer ${player.name} [${player.id}] It's Your Turn :`,
    );

    if (/^\d+$/.test(data) && +data > 0 && +data <= player.cards.length) {
      player.cards.splice((+data) - 1, 1);
      chance = (chance + 1) % players.length;
    }
  }
};

const broadcast = (players, message) => {
  players.forEach(async ({ conn }) => {
    await writeOnConnection(
      conn,
      message,
    );
  });
};
// 10.132.124.208

const takeInput = async (conn, message) => {
  const buff = new Uint8Array(10);
  writeOnConnection(conn, message);
  const count = await conn.read(buff);
  const rawData = buff.slice(0, count);

  const data = decode(rawData).trim();
  return data;
};
