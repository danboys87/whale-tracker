// explorerClient.js
// Pakai Etherscan V2 unified API - satu API key & satu base URL buat semua
// chain EVM yang terdaftar di chains.js, tinggal beda parameter "chainid".
import { getSettings } from "./settingsStore.js";
import { getChain } from "./chains.js";

const V2_BASE = "https://api.etherscan.io/v2/api";

// Free tier Etherscan cuma ngizinin beberapa request/detik. Kita jaga jarak
// minimal antar-request biar nggak kena rate limit walau token yang
// dipantau banyak.
const MIN_GAP_MS = 350;
let lastCallAt = 0;

async function throttle() {
  const wait = lastCallAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

export async function fetchTokenTransfers(tokenAddress, chainKey, startBlock) {
  const chain = getChain(chainKey);
  if (!chain) throw new Error(`Chain tidak dikenal: ${chainKey}`);
  if (chain.type !== "evm") {
    throw new Error(`Chain "${chain.name}" belum didukung untuk fetch transfer (butuh implementasi khusus)`);
  }

  await throttle();

  const url = new URL(V2_BASE);
  url.searchParams.set("chainid", chain.etherscanChainId);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "tokentx");
  url.searchParams.set("contractaddress", tokenAddress);
  url.searchParams.set("startblock", startBlock ?? 0);
  url.searchParams.set("endblock", 99999999);
  url.searchParams.set("sort", "desc");
  url.searchParams.set("apikey", getSettings().explorerApiKey);

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "1") {
    if (data.message === "No transactions found") return [];
    throw new Error(`Explorer API error (${chain.name}/${tokenAddress}): ${data.result || data.message}`);
  }

  return data.result; // array of { hash, from, to, value, tokenDecimal, blockNumber, tokenSymbol, ... }
}
