import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";
import {
  displayCard,
  displayCards,
  revealInitialCards,
} from "./display_cards.js";
import {
  broadcast,
  broadcastWinningMessage,
  checkWin,
  delay,
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

const isBetween = (input, start, end) => input >= start && input <= end;

const doesCardExists = (player, input) => player.cards[input - 1] !== null;

const isValidInput = (input, player) =>
  Number.isInteger(input) && isBetween(input, 1, CARDS_TO_DISTRIBUTE) &&
  doesCardExists(player, input);

const validateCommand = ({ command, arg }, player) => {
  if (command.toUpperCase() === "S" && isValidInput(+arg, player)) {
    return { succeed: true, command: "SWAP", arg: parseInt(arg) };
  }
  if (command.toUpperCase() === "D") {
    return { succeed: true, command: "DISCARD" };
  }
  return { succeed: false };
};

const parseCommand = (playerCommand) => {
  const [command, arg] = playerCommand.trim().toUpperCase().split(/\s+/g);
  return { command, arg };
};

const parseInputForDrawCard = async (player) => {
  while (true) {
    const playerCommand = await takeInput(
      player.conn,
      "\n\nType discard[d] or swap[s <card number>] : ",
    );

    const parsed = parseCommand(playerCommand, player);
    const { succeed, command, arg } = validateCommand(parsed, player);

    if (succeed) {
      return { command, arg };
    }

    await writeOnConnection(player.conn, "INVALID COMMAND ❌\n");
  }
};

const nextPlayer = (gameDetails) =>
  (gameDetails.chance + 1) % gameDetails.players.length;

const handleDrawTurn = async (gameDetails) => {
  const { currentPlayer } = gameDetails;
  const drawnCard = gameDetails.cardDistributor.next().value;
  displayCard(
    currentPlayer.conn,
    drawnCard.imageCode,
    drawnCard.id,
    { x: 1, y: 1 },
    true,
    false,
  );

  const { command, arg } = await parseInputForDrawCard(currentPlayer);

  if (command === "DISCARD") {
    gameDetails.discardedCard = drawnCard;
  }
  if (command === "SWAP") {
    gameDetails.discardedCard = currentPlayer.cards[arg - 1];
    currentPlayer.cards[arg - 1] = drawnCard;
  }
  gameDetails.chance = nextPlayer(gameDetails);
};

const lockGame = (gameDetails) => {
  gameDetails.wasLocked = true;
  gameDetails.lockedBy = gameDetails.currentPlayer.id;
  gameDetails.chance = nextPlayer(gameDetails);
  return;
};

const isLockCommand = (playerInput) => playerInput.trim().toUpperCase() === "L";

const isDrawCommand = (playerInput) => playerInput.trim().toUpperCase() === "D";

const handleUserInput = async (gameDetails) => {
  while (true) {
    const inputMessage =
      `\n\nPlayer ${gameDetails.currentPlayer.name} [${gameDetails.currentPlayer.id}] It's Your Turn :\nchoose [d] for draw or [l] for lock :`;

    const playerInput = await takeInput(
      gameDetails.currentPlayer.conn,
      inputMessage,
    );

    if (isDrawCommand(playerInput)) {
      await handleDrawTurn(gameDetails);
      return;
    }

    if (!gameDetails.wasLocked && isLockCommand(playerInput)) {
      lockGame(gameDetails);
      return;
    }
  }
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

    gameDetails.currentPlayer = gameDetails.players[gameDetails.chance];

    if (checkWin(gameDetails)) {
      await broadcastWinningMessage(gameDetails.players);
      break;
    }

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
  lockedBy: null,
  cardDistributor,
  discardedCard: { id: 1000, imageCode: "BACK_BLUE" },
});

const initializeGame = async (players) => {
  const shuffledCards = shuffle(cards);
  const cardDistributor = drawCard(shuffledCards);
  distributeCards(cardDistributor, players);

  const gameDetails = initGameDetails(players, cardDistributor);

  await revealInitialCards(gameDetails, 2);
  await delay(10000);
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
