import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";
import { cardImages } from "./cards_image.js";

const CARD_WIDTH_OFFSET = 12;
const CARD_HEIGHT_OFFSET = 8;
const PLAYERS_COUNT = 2;
const CARDS_TO_DISTRIBUTE = 5;
const DELAY_BETWEEN_CARD_TRANSFER = 5;
const SCREEN_CLEAR = "\x1b[2J\x1b[H";
const BACK_CARD = "BACK_BLUE";

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

const broadcast = (players, message) => {
  players.forEach(async ({ conn }) => {
    await writeOnConnection(
      conn,
      message,
    );
  });
};

const writeOnConnection = async (conn, content) => {
  await conn.write(encode(content));
};

const takeInput = async (conn, message) => {
  const buff = new Uint8Array(10);
  writeOnConnection(conn, message);
  const count = await conn.read(buff);
  const rawData = buff.slice(0, count);

  const data = decode(rawData).trim();
  return data;
};

export const escSeqOfImage = (imageCode, cardId) => {
  const ESC = "\x1b";
  const card = cardImages[imageCode];
  const cardImage = ESC + "_G" + `q=2,i=${cardId}` +
    `,a=T,f=100;` + card +
    ESC + "\\";
  return cardImage;
};

const displayCard = async (
  conn,
  imageCode,
  id,
  { x, y },
  toShowFace = false,
) => {
  const toShow = toShowFace ? imageCode.trim().toUpperCase() : BACK_CARD;
  const image = escSeqOfImage(toShow, id);
  await writeOnConnection(conn, moveCursorTo(x, y) + image);
  await delay(DELAY_BETWEEN_CARD_TRANSFER);
};

const displayCards = async (currentPlayer, players) => {
  await writeOnConnection(currentPlayer.conn, SCREEN_CLEAR);
  const cardPos = { x: 0, y: 2 };
  const showFace = true;

  writeOnConnection(
    currentPlayer.conn,
    `Hello Player : ${currentPlayer.name} ${currentPlayer.id}`,
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

  let pad = "\n\n\n";
  for (const player of otherPlayers) {
    cardPos.y += CARD_HEIGHT_OFFSET;
    cardPos.x = 0;
    writeOnConnection(
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
  }
};

const drawCard = function* (cards) {
  while (cards.length !== 0) {
    yield cards.pop();
  }
};

const delay = async (time) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

const preGameSetup = async (server, players) => {
  let id = 523123;
  for await (const conn of server) {
    const player = { conn, cards: [] };
    const name = await takeInput(
      conn,
      `\n\n\nEnter Your Name [player Id : ${id}] :`,
    );

    player.id = id++;
    player.name = name;
    console.log("inside pre game setup");

    players.push(player);

    broadcast(
      players,
      `\n\nWaiting for players....\nConnected : ${players.length}\nRemaining : ${
        PLAYERS_COUNT - players.length
      }`,
    );
    if (players.length === PLAYERS_COUNT) {
      break;
    }
  }
};

const didWin = (player) => player.cards.every((card) => card === null);

const calculateScore = (cards) => {
  return cards.reduce((acc, card) => {
    const cardValue = card === null ? 0 : card.value;
    return acc + cardValue;
  }, 0);
};

const playersRanking = (players) =>
  players.map(({ name, cards, id }) => ({
    id,
    name,
    score: calculateScore(cards),
  })).sort((a, b) => a - b);

const handleWinningCondition = (chance, players, isLocked, lockedPlayerId) => {
  const previousPlayer =
    players[(chance + players.length - 1) % players.length];

  if (didWin(previousPlayer)) {
    broadcast(
      players,
      `\n\n?********   Player ${previousPlayer.name} [${previousPlayer.id}] Has Won!  *******\n`,
    );
    return true;
  }
  const currentPlayer = players[chance];
  if (isLocked && lockedPlayerId === currentPlayer.id) {
    const scoreBoard = playersRanking(players);
    const wonPlayer = scoreBoard[0];
    broadcast(
      players,
      `\n\n?********   Player ${wonPlayer.name} [${wonPlayer.id}] Has Won!  *******\n`,
    );
    return true;
  }
  return false;
};

export const startCardRemovalGameServer = async (port, hostname) => {
  const server = Deno.listen({
    hostname,
    port,
    transport: "tcp",
  });

  const shuffledCards = shuffle(cards);
  const cardDistributor = drawCard(shuffledCards);
  const players = [];

  await preGameSetup(server, players);

  distributeCards(cardDistributor, players);

  let chance = 0;
  let isLocked = false;
  let lockedPlayerId;
  while (true) {
    for (const player of players) {
      await displayCards(player, players);
    }

    const didWon = handleWinningCondition(
      chance,
      players,
      isLocked,
      lockedPlayerId,
    );
    if (didWon) break;
    const currentPlayer = players[chance];

    broadcast(
      players,
      ` \n\n Now player ${currentPlayer.name} [${currentPlayer.id}] will Play!\n`,
    );

    const playerInput = await takeInput(
      currentPlayer.conn,
      `\n\nPlayer ${currentPlayer.name} [${currentPlayer.id}] It's Your Turn :`,
    );

    if (!isLocked && playerInput.trim().toUpperCase() === "LOCK") {
      isLocked = true;
      lockedPlayerId = currentPlayer.id;
      chance = (chance + 1) % players.length;
    }

    if (
      /^\d+$/.test(playerInput) && +playerInput > 0 &&
      +playerInput <= currentPlayer.cards.length
    ) {
      currentPlayer.cards[+playerInput - 1] = null;
      console.log({
        cardNumberChoose: (+playerInput - 1),
        player: currentPlayer,
      });
      chance = (chance + 1) % players.length;
    }
  }
};
