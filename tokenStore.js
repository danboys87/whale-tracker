// tokenStore.js
import fs from "fs";
import { getChain } from "./chains.js";

const FILE = "./tokens.json";

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeAll(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}

export function getTokens() {
  return readAll();
}

export function addToken({ address, chain, symbol, name }) {
  if (!address || !chain) throw new Error("address dan chain wajib diisi");

  const chainInfo = getChain(chain);
  if (!chainInfo) throw new Error(`Chain "${chain}" tidak dikenal`);
  if (chainInfo.type !== "evm") throw new Error(`Chain "${chainInfo.name}" belum didukung untuk dipantau`);

  const list = readAll();
  const normalized = address.toLowerCase();

  if (list.some((t) => t.address === normalized && t.chain === chain)) {
    throw new Error("Token ini sudah dipantau");
  }

  const entry = {
    address: normalized,
    chain,
    symbol: symbol || "",
    name: name || "",
    addedAt: new Date().toISOString(),
  };
  list.push(entry);
  writeAll(list);
  return entry;
}

export function removeToken(address, chain) {
  const list = readAll();
  const filtered = list.filter((t) => !(t.address === address.toLowerCase() && t.chain === chain));
  writeAll(filtered);
  return filtered.length !== list.length;
}
