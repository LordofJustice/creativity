import Table from "npm:cli-table3";
import { brightGreen } from "jsr:@std/fmt/colors";

export const delay = async (time) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

const encode = (text) => new TextEncoder().encode(text);

export const decode = (arrBuffer) => new TextDecoder().decode(arrBuffer);

export const takeInput = async (conn, message) => {
  const buff = new Uint8Array(10);
  await writeOnConnection(conn, message);
  const count = await conn.read(buff);
  const rawData = buff.slice(0, count);

  const data = decode(rawData).trim();
  return data;
};

export const writeOnConnection = async (conn, content) => {
  await conn.write(encode(content));
};

export const broadcast = (players, message) => {
  players.forEach(async ({ conn }) => {
    await writeOnConnection(
      conn,
      message,
    );
  });
};

const formateScoreBoard = (scoreBoard) => {
  const table = new Table({
    head: [
      brightGreen("Rank"),
      brightGreen("Player Id"),
      brightGreen("Name"),
      brightGreen("Score"),
    ],
  });
  scoreBoard.forEach((player, i) => {
    table.push([i + 1, player.id, player.name, player.score]);
  });
  return table.toString();
};

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
  })).sort((a, b) => a.score - b.score);

export const broadcastWinningMessage = (players) => {
  const scoreBoard = playersRanking(players);
  const wonPlayer = scoreBoard[0];
  const formattedScoreBoard = formateScoreBoard(scoreBoard);
  const winningMessage =
    `\n\n?********   Player ${wonPlayer.name} [${wonPlayer.id}] Has Won!  *******\n${formattedScoreBoard}\n`;
  broadcast(players, winningMessage);
};

const areAllCardsNull = (player) => player.cards.every((card) => card === null);

export const checkWin = (
  { chance, players, currentPlayer, wasLocked, lockedBy },
) => {
  const previousPlayer =
    players[(chance + players.length - 1) % players.length];

  return areAllCardsNull(previousPlayer) ||
    wasLocked && lockedBy === currentPlayer.id;
};
