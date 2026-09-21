// chains.js
// Registry semua chain yang didukung. Untuk nambah chain EVM baru, tinggal
// tambah satu entry (chainId Etherscan-V2 + info explorer). Untuk chain
// non-EVM (Solana, dll), butuh implementasi terpisah di explorerClient
// karena API-nya beda total dari Etherscan-style — lihat catatan di bawah.

export const CHAINS = {
  eth: {
    name: "Ethereum",
    type: "evm",
    etherscanChainId: 1, // dipakai di Etherscan V2 unified API (?chainid=)
    dexscreenerId: "ethereum", // dipakai buat cocokin hasil DexScreener
    explorerTxUrl: "https://etherscan.io/tx/",
  },
  bsc: {
    name: "BNB Chain",
    type: "evm",
    etherscanChainId: 56,
    dexscreenerId: "bsc",
    explorerTxUrl: "https://bscscan.com/tx/",
  },
  arbitrum: {
    name: "Arbitrum",
    type: "evm",
    etherscanChainId: 42161,
    dexscreenerId: "arbitrum",
    explorerTxUrl: "https://arbiscan.io/tx/",
  },
  base: {
    name: "Base",
    type: "evm",
    etherscanChainId: 8453,
    dexscreenerId: "base",
    explorerTxUrl: "https://basescan.org/tx/",
  },

  // --- Placeholder untuk nanti ---
  // Solana BUKAN EVM: nggak punya "contract address" ERC-20 style, nggak
  // bisa dipantau lewat Etherscan-style API (module=account&action=tokentx).
  // Kalau nanti mau ditambahkan, butuh:
  //   1. Ganti explorerClient.js: tambah cabang khusus type "solana" yang
  //      manggil RPC Solana / Helius API (bukan fetchTokenTransfers biasa)
  //   2. Address token Solana tetap bisa dideteksi otomatis lewat
  //      DexScreener (dexscreenerId: "solana") - itu bagian yang SUDAH
  //      generic dan nggak perlu diubah.
  // solana: {
  //   name: "Solana",
  //   type: "solana",
  //   dexscreenerId: "solana",
  //   explorerTxUrl: "https://solscan.io/tx/",
  // },
};

export function getChain(chainKey) {
  return CHAINS[chainKey] || null;
}

export function listChains() {
  return Object.entries(CHAINS).map(([key, c]) => ({ key, ...c }));
}

export function findChainByDexscreenerId(dexId) {
  const entry = Object.entries(CHAINS).find(([, c]) => c.dexscreenerId === dexId);
  return entry ? { key: entry[0], ...entry[1] } : null;
}
