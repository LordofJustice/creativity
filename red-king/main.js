// import { startCardRemovalGameServer } from "./src/card_removal_game.js";
import { startRedKingServer } from "./src/red_king.js";

const main = async () => {
  // const hostname = "192.168.1.98";
  // const hostname = "10.148.29.177";
  const hostname = "10.132.124.208";
  await startRedKingServer(8000, hostname);
};

await main();
