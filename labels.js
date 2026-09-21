// labels.js
// Prinsip: transfer DARI exchange -> whale menarik token (bisa jadi mau hold/beli via OTC)
//          transfer KE exchange   -> whale menyetor token (indikasi mau jual)
//          transfer via DEX router/pool -> swap langsung (beli/jual di DEX)
import { getAddressMap } from "./addressStore.js";

// Default bawaan (bisa ditambah lewat dashboard, tersimpan di addresses.json)
export const DEFAULT_EXCHANGES = {
  "0x28c6c06298d514db089934071355e5743bf21d60": "Binance 14",
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance 15",
  "0xdfd5293d8e347dfe59e90efd55b2956a1343963d": "Binance 16",
  "0x5041ed759dd4afc3a72b8192c143f72f4724081a": "OKX",
};

export function classifyDirection(from, to) {
  const known = { ...DEFAULT_EXCHANGES, ...getAddressMap() };

  const fromLabel = known[from?.toLowerCase()];
  const toLabel = known[to?.toLowerCase()];

  if (fromLabel && !toLabel) return { type: "WITHDRAW_FROM_EXCHANGE", exchange: fromLabel };
  if (toLabel && !fromLabel) return { type: "DEPOSIT_TO_EXCHANGE", exchange: toLabel };
  return { type: "WALLET_TO_WALLET" };
}
