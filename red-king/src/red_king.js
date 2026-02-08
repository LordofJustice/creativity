import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";
import {
  displayCard,
  displayCards,
  formateScoreBoard,
} from "./display_cards.js";
import { broadcast, takeInput, writeOnConnection } from "./red_king_lib.js";

const PLAYERS_COUNT = 2;
const CARDS_TO_DISTRIBUTE = 4;
const START_ID = 45304;

const distributeCards = (distributeCard, players) => {
  for (const player of players) {
    for (let i = 0; i < CARDS_TO_DISTRIBUTE; i++) {
      player.cards.push(distributeCard.next().value);
    }
  }
  return players;
};

const drawCard = function* (cards) {
  while (cards.length !== 0) {
    yield cards.pop();
  }
};

const preGameSetup = async (server) => {
  let id = START_ID;
  const players = [];
  for await (const conn of server) {
    const player = { conn, cards: [] };
    const name = await takeInput(
      conn,
      `\n\n\nEnter Your Name [player Id : ${id}] :`,
    );

    player.id = id++;
    player.name = name;

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
  return players;
};

const calculateScore = (cards) => {
  return cards.reduce((acc, card) => {
    const cardValue = card === null ? 0 : card.value;
    return acc + cardValue;
  }, 0);
};

const didWin = (player) => player.cards.every((card) => card === null);

const playersRanking = (players) =>
  players.map(({ name, cards, id }) => ({
    id,
    name,
    score: calculateScore(cards),
  })).sort((a, b) => a - b);

const handleWinningCondition = (
  { chance, players, wasLocked, lockedPlayerId },
) => {
  const previousPlayer =
    players[(chance + players.length - 1) % players.length];

  const currentPlayer = players[chance];
  if (
    didWin(previousPlayer) || wasLocked && lockedPlayerId === currentPlayer.id
  ) {
    const scoreBoard = playersRanking(players);
    console.table(scoreBoard);
    console.log({ scoreBoard });
    const wonPlayer = scoreBoard[0];
    const formattedScoreBoard = formateScoreBoard(scoreBoard);
    console.log({ formattedScoreBoard });
    const winningMessage =
      `\n\n?********   Player ${wonPlayer.name} [${wonPlayer.id}] Has Won!  *******\n${formattedScoreBoard}\n`;
    broadcast(players, winningMessage);
    return true;
  }
  return false;
};

const isValidInput = (playerInput, player) =>
  /^\d+$/.test(playerInput) && (+playerInput > 0 &&
    +playerInput <= CARDS_TO_DISTRIBUTE) &&
  !player.cards[+playerInput - 1] !== null;

const parseCommand = (playerCommand, player) => {
  const [command, arg] = playerCommand.trim().toUpperCase().split(/\s+/g);
  if (command === "S" && isValidInput(arg, player)) {
    return { succeed: true, command: "SWAP", arg: +arg };
  } else if (command === "D") {
    return { succeed: true, command: "DISCARD" };
  }
  return { succeed: false, error: "invalid command" };
};

const handleInputForDrawCard = async (currentPlayer) => {
  const playerCommand = await takeInput(
    currentPlayer.conn,
    "\n\ndiscard[d] or swap[s] <card number> : ",
  );
  const { succeed, command, arg } = parseCommand(playerCommand, currentPlayer);
  if (!succeed) {
    await writeOnConnection(currentPlayer.conn, "INVALID COMMAND OR ARGUMENT");
    return handleInputForDrawCard(currentPlayer);
  }
  return { command, arg };
};

const handleDrawCondition = async (
  currentPlayer,
  cardDistributor,
  discardedCard,
) => {
  let discarded = discardedCard;
  const drawnCard = cardDistributor.next().value;
  displayCard(currentPlayer.conn, drawnCard.imageCode, drawnCard.id, {
    x: 48,
    y: 0,
  }, true);
  const { command, arg } = await handleInputForDrawCard(currentPlayer);
  if (command === "DISCARD") {
    discarded = drawnCard;
  } else if (command === "SWAP") {
    discarded = currentPlayer.cards[arg - 1];
    currentPlayer.cards[arg - 1] = drawnCard;
  }
  return discarded;
};

const isLockCommand = (playerInput) => playerInput.trim().toUpperCase() === "L";

const isDrawCommand = (playerInput) => playerInput.trim().toUpperCase() === "D";

const handleUserInput = async (
  {
    wasLocked,
    currentPlayer,
    chance,
    players,
    lockedPlayerId,
    cardDistributor,
    discardedCard,
  },
) => {
  const inputMessage =
    `\n\nPlayer ${currentPlayer.name} [${currentPlayer.id}] It's Your Turn :
      choose draw or lock :`;

  const playerInput = await takeInput(currentPlayer.conn, inputMessage);

  if (isDrawCommand(playerInput)) {
    discardedCard = await handleDrawCondition(
      currentPlayer,
      cardDistributor,
      discardedCard,
    );
    chance = (chance + 1) % players.length;
  } else if (!wasLocked && isLockCommand(playerInput)) {
    wasLocked = true;
    lockedPlayerId = currentPlayer.id;
    chance = (chance + 1) % players.length;
  } else {
    return handleUserInput({
      wasLocked,
      currentPlayer,
      chance,
      players,
      lockedPlayerId,
      cardDistributor,
      discardedCard,
    });
  }
  return { wasLocked, lockedPlayerId, chance, discardedCard };
};

const startGame = async (players) => {
  const shuffledCards = shuffle(cards);
  const cardDistributor = drawCard(shuffledCards);
  distributeCards(cardDistributor, players);

  let lockedPlayerId;
  let discardedCard;
  const gameDetails = {
    players,
    chance: 0,
    wasLocked: false,
    lockedPlayerId,
    cardDistributor,
    discardedCard,
  };

  while (true) {
    for (const player of players) {
      await displayCards(player, players);
    }

    const didWon = handleWinningCondition(gameDetails);

    if (didWon) break;

    gameDetails.currentPlayer = players[gameDetails.chance];
    broadcast(
      players,
      ` \n\n Now player ${gameDetails.currentPlayer.name} [${gameDetails.currentPlayer.id}] will Play!\n`,
    );

    const { wasLocked, lockedPlayerId, chance, discardedCard } =
      await handleUserInput(
        gameDetails,
      );
    gameDetails.wasLocked = wasLocked;
    gameDetails.lockedPlayerId = lockedPlayerId;
    gameDetails.chance = chance;
    gameDetails.discardedCard = discardedCard;
  }
};

export const startRedKingServer = async (port, hostname) => {
  const server = Deno.listen({
    hostname,
    port,
    transport: "tcp",
  });

  const players = await preGameSetup(server);
  await startGame(players);
};
