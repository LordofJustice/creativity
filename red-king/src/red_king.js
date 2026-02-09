import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";
import { displayCard, displayCards } from "./display_cards.js";
import {
  broadcast,
  broadcastWinningMessage,
  takeInput,
  writeOnConnection,
} from "./red_king_lib.js";

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
    if (players.length === PLAYERS_COUNT) break;

    const message =
      `\n\nWaiting for players....\nConnected : ${players.length}\nRemaining : ${
        PLAYERS_COUNT - players.length
      }`;
    await broadcast(players, message);
  }
  return players;
};

const areAllCardsNull = (player) => player.cards.every((card) => card === null);

const didWin = ({ chance, players, wasLocked, lockedPlayerId }) => {
  const previousPlayer =
    players[(chance + players.length - 1) % players.length];
  const currentPlayer = players[chance];
  return areAllCardsNull(previousPlayer) ||
    wasLocked && lockedPlayerId === currentPlayer.id;
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
    "\n\nType discard[d] or swap[s <card number>] : ",
  );
  const { succeed, command, arg } = parseCommand(playerCommand, currentPlayer);
  if (!succeed) {
    await writeOnConnection(currentPlayer.conn, "INVALID COMMAND OR ARGUMENT");
    return handleInputForDrawCard(currentPlayer);
  }
  return { command, arg };
};

const handleDrawCondition = async (gameDetails) => {
  const { currentPlayer } = gameDetails;
  const drawnCard = gameDetails.cardDistributor.next().value;
  displayCard(
    currentPlayer.conn,
    drawnCard.imageCode,
    drawnCard.id,
    { x: 0, y: 0 },
    true,
    false,
  );

  const { command, arg } = await handleInputForDrawCard(currentPlayer);

  if (command === "DISCARD") {
    gameDetails.discardedCard = drawnCard;
  } else if (command === "SWAP") {
    gameDetails.discardedCard = currentPlayer.cards[arg - 1];
    currentPlayer.cards[arg - 1] = drawnCard;
  }
  gameDetails.chance = (gameDetails.chance + 1) % gameDetails.players.length;
};

const handleLockCondition = (gameDetails) => {
  gameDetails.wasLocked = true;
  gameDetails.lockedPlayerId = gameDetails.currentPlayer.id;
  gameDetails.chance = (gameDetails.chance + 1) % gameDetails.players.length;
  return;
};

const isLockCommand = (playerInput) => playerInput.trim().toUpperCase() === "L";

const isDrawCommand = (playerInput) => playerInput.trim().toUpperCase() === "D";

const handleUserInput = async (gameDetails) => {
  const inputMessage =
    `\n\nPlayer ${gameDetails.currentPlayer.name} [${gameDetails.currentPlayer.id}] It's Your Turn :
      choose [d] for draw or [l] for lock :`;

  const playerInput = await takeInput(
    gameDetails.currentPlayer.conn,
    inputMessage,
  );

  if (isDrawCommand(playerInput)) {
    await handleDrawCondition(gameDetails);
    return;
  }
  if (!gameDetails.wasLocked && isLockCommand(playerInput)) {
    handleLockCondition(gameDetails);
    return;
  }
  await handleUserInput(gameDetails);
  return;
};

const startGame = async (gameDetails) => {
  while (true) {
    for (const player of gameDetails.players) {
      await displayCards(
        player,
        gameDetails.players,
        gameDetails.discardedCard,
      );
    }

    if (didWin(gameDetails)) {
      await broadcastWinningMessage(gameDetails.players);
      break;
    }

    gameDetails.currentPlayer = gameDetails.players[gameDetails.chance];
    const playChanceMessage =
      `\n Now player ${gameDetails.currentPlayer.name} [${gameDetails.currentPlayer.id}] will Play!\n`;
    await broadcast(gameDetails.players, playChanceMessage);

    await handleUserInput(gameDetails);
  }
};

const initGameDetails = (players, cardDistributor) => ({
  players,
  chance: 0,
  wasLocked: false,
  lockedPlayerId: undefined,
  cardDistributor,
  discardedCard: { id: 1000, imageCode: "BACK_BLUE" },
});

const initializeGame = async (players) => {
  const shuffledCards = shuffle(cards);
  const cardDistributor = drawCard(shuffledCards);
  distributeCards(cardDistributor, players);

  const gameDetails = initGameDetails(players, cardDistributor);

  await startGame(gameDetails);
};

export const startRedKingServer = async (port, hostname) => {
  const server = Deno.listen({
    hostname,
    port,
    transport: "tcp",
  });

  const players = await preGameSetup(server);
  await initializeGame(players);
};
