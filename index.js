// index.js
import "dotenv/config";
import { fetchTokenTransfers } from "./explorerClient.js";
import { getTokenPriceUsd, getPercentOfSupply } from "./priceClient.js";
import { classifyDirection } from "./labels.js";
import { getLastBlock, setLastBlock } from "./state.js";
import { sendTelegramAlert, formatWhaleMessage } from "./telegramNotifier.js";
import { logAlert } from "./alertLogger.js";
import { getTokens } from "./tokenStore.js";
import { getSettings } from "./settingsStore.js";
import { startDashboardServer } from "./server.js";

async function processToken(token) {
  const { address, chain } = token;
  const { minUsdValue } = getSettings();
  const lastBlock = getLastBlock(chain, address);
  const priceUsd = await getTokenPriceUsd(address);
  const transfers = await fetchTokenTransfers(address, chain, lastBlock + 1);

  if (transfers.length === 0) return;

  const sorted = [...transfers].reverse(); // dari terlama ke terbaru
  let highestBlock = lastBlock;

  for (const tx of sorted) {
    const decimals = Number(tx.tokenDecimal || 18);
    const amount = Number(tx.value) / 10 ** decimals;
    const usdValue = amount * priceUsd;

    highestBlock = Math.max(highestBlock, Number(tx.blockNumber));

    if (usdValue < minUsdValue) continue; // bukan whale, skip

    const direction = classifyDirection(tx.from, tx.to);
    const percentOfSupply = await getPercentOfSupply(address, amount);
    const message = formatWhaleMessage({
      direction,
      usdValue,
      amount,
      symbol: tx.tokenSymbol,
      hash: tx.hash,
      chain,
      percentOfSupply,
    });

    console.log(message);
    if (direction.type !== "WALLET_TO_WALLET") {
      await sendTelegramAlert(message);
    }
    logAlert({
      hash: tx.hash,
      symbol: tx.tokenSymbol,
      amount,
      usdValue,
      percentOfSupply,
      direction: direction.type,
      exchange: direction.exchange || null,
      chain,
    });
  }

  setLastBlock(chain, address, highestBlock);
}

async function tick() {
  const tokens = getTokens();
  if (tokens.length === 0) {
    console.log("Belum ada token yang dipantau. Tambahkan lewat tab Token di dashboard.");
    return;
  }

  for (const token of tokens) {
    try {
      await processToken(token);
    } catch (err) {
      console.error(`Error memproses ${token.symbol || token.address} (${token.chain}):`, err.message);
    }
  }
}

// setTimeout rekursif (bukan setInterval) supaya kalau pollIntervalMs
// diubah lewat tab Config, siklus berikutnya langsung ikut interval baru
// tanpa perlu restart bot.
function scheduleNextTick() {
  const { pollIntervalMs } = getSettings();
  setTimeout(async () => {
    await tick().catch((err) => console.error("Tick error:", err.message));
    scheduleNextTick();
  }, pollIntervalMs);
}

async function main() {
  console.log("Whale tracker started");
  startDashboardServer();
  await tick().catch((err) => console.error("Tick error:", err.message));
  scheduleNextTick();
}

main();
