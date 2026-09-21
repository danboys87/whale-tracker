// telegramNotifier.js
import { getSettings } from "./settingsStore.js";
import { getChain } from "./chains.js";

export async function sendTelegramAlert(text) {
  const { telegramBotToken, telegramChatId } = getSettings();
  if (!telegramBotToken || !telegramChatId) {
    console.log("Telegram belum dikonfigurasi (isi lewat tab Config di dashboard) - alert dilewati.");
    return;
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Gagal mengirim alert Telegram:", body);
  }
}

export function formatWhaleMessage({ direction, usdValue, amount, symbol, hash, chain, percentOfSupply }) {
  const explorerBase = getChain(chain)?.explorerTxUrl || "https://etherscan.io/tx/";
  const directionLabel =
    {
      WITHDRAW_FROM_EXCHANGE: `🟢 Withdraw dari *${direction.exchange}*`,
      DEPOSIT_TO_EXCHANGE: `🔴 Deposit ke *${direction.exchange}*`,
      WALLET_TO_WALLET: `⚪ Wallet-to-wallet`,
    }[direction.type] || "⚪ Transfer";

  const supplyLine =
    percentOfSupply !== null && percentOfSupply !== undefined
      ? `\n% Supply: ${percentOfSupply.toFixed(4)}%`
      : "";

  return (
    `🐋 *Whale Alert*\n` +
    `${directionLabel}\n` +
    `Jumlah: ${amount.toLocaleString()} ${symbol} (~$${usdValue.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })})` +
    supplyLine +
    `\nTX: ${explorerBase}${hash}`
  );
}
