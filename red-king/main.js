import { startCardRemovalGameServer } from "./src/card_removal_game.js";
// import { startGameServer } from "./src/red_king.js";

const main = async () => {
  const hostname = "192.168.1.98";
  // await startGameServer(8000, hostname);
  await startCardRemovalGameServer(8080, hostname);
};

await main();
