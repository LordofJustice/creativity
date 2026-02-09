import { startRedKingServer } from "./src/red_king.js";

const main = async () => {
  const hostname = "0.0.0.0";
  await startRedKingServer(8000, hostname);
};

await main();
