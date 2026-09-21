// priceClient.js
// Ambil harga & info token dari DexScreener (gratis, tanpa API key, dan
// bisa deteksi chain otomatis cukup dari address - dipakai buat fitur
// auto-detect di tab Token).
import { findChainByDexscreenerId } from "./chains.js";

const marketCache = new Map(); // tokenAddress -> { data, cachedAt }
const CACHE_TTL_MS = 60_000;

async function fetchDexscreener(tokenAddress) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.pairs || [];
}

// Ambil harga + market cap, dan hitung circulating supply perkiraan
// (marketCap / priceUsd). DexScreener nggak nyediain circulating supply
// langsung, jadi ini estimasi - cukup akurat untuk keperluan "% dari supply".
async function getMarketData(tokenAddress) {
  const now = Date.now();
  const cached = marketCache.get(tokenAddress);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) return cached.data;

  const pairs = await fetchDexscreener(tokenAddress);
  const pair = pairs[0];
  if (!pair) throw new Error(`Token pair tidak ditemukan di DexScreener: ${tokenAddress}`);

  const priceUsd = Number(pair.priceUsd) || null;
  const marketCap = Number(pair.marketCap) || Number(pair.fdv) || null;
  const circulatingSupply = priceUsd && marketCap ? marketCap / priceUsd : null;

  const data = { priceUsd, marketCap, circulatingSupply };
  marketCache.set(tokenAddress, { data, cachedAt: now });
  return data;
}

export async function getTokenPriceUsd(tokenAddress) {
  const { priceUsd } = await getMarketData(tokenAddress);
  if (!priceUsd) throw new Error(`Harga tidak ditemukan: ${tokenAddress}`);
  return priceUsd;
}

// % dari circulating supply yang dipindahkan dalam satu transaksi.
// Return null kalau circulating supply nggak diketahui (bukan error fatal -
// alert tetap lanjut, cuma kolom %-nya kosong).
export async function getPercentOfSupply(tokenAddress, amount) {
  try {
    const { circulatingSupply } = await getMarketData(tokenAddress);
    if (!circulatingSupply) return null;
    return (amount / circulatingSupply) * 100;
  } catch {
    return null;
  }
}

// Dipakai form "Tambah token": user cuma masukin address, ini yang
// nentuin chain-nya apa + ambil simbol/nama tokennya.
export async function lookupToken(address) {
  const pairs = await fetchDexscreener(address);
  if (pairs.length === 0) return null;

  // Ambil pair dengan likuiditas terbesar supaya datanya paling representatif
  const best = pairs.reduce((a, b) => ((b.liquidity?.usd || 0) > (a.liquidity?.usd || 0) ? b : a));
  const chain = findChainByDexscreenerId(best.chainId);

  return {
    chainKey: chain?.key || null,
    chainName: chain?.name || best.chainId, // tetap tampilkan meski belum didukung
    supported: chain?.type === "evm",
    symbol: best.baseToken?.symbol || "",
    name: best.baseToken?.name || "",
    priceUsd: Number(best.priceUsd) || null,
  };
}
