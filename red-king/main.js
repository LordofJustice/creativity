import { startGameServer } from "./src/red_king.js";

const main = async () => {
  await startGameServer(8000);
};

await main();
