import { cards } from "./cards.js";
import { shuffle } from "jsr:@std/random/shuffle";

const players = [
  {
    playerName: "vinod",
    cards: { upperCards: [], lowerCards: [] },
  },
  {
    playerName: "vikas",
    cards: { upperCards: [], lowerCards: [] },
  },
  {
    playerName: "vivu",
    cards: { upperCards: [], lowerCards: [] },
  },
  {
    playerName: "my",
    cards: { upperCards: [], lowerCards: [] },
  },
];

const drawCard = function* (cards) {
  while (cards.length !== 0) {
    yield cards.pop();
  }
};

const deckCards = (cards) => {
  return drawCard(cards);
};

const distributeCards = (distributeCard, players) => {
  for (const player of players) {
    player.cards.upperCards.push(
      distributeCard.next().value,
      distributeCard.next().value,
    );
    player.cards.lowerCards.push(
      distributeCard.next().value,
      distributeCard.next().value,
    );
  }
  return players;
};

export const startGame = () => {
  const shuffledCards = shuffle(cards);
  const cardDistributor = deckCards(shuffledCards);
  console.log(shuffledCards);
  distributeCards(cardDistributor, players);
  console.log(players);
  const cardSymbol = [
    "♠️",
    "♥️",
    "♣️",
    "♦️",
  ];
  console.log(...cardSymbol);
};
