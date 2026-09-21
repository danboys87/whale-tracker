// state.js
import fs from "fs";
import { config } from "./config.js";

function key(chain, address) {
  return `${chain}:${address.toLowerCase()}`;
}

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(config.stateFile, "utf-8"));
  } catch {
    return {};
  }
}

export function getLastBlock(chain, address) {
  const all = readAll();
  return all[key(chain, address)] || 0;
}

export function setLastBlock(chain, address, blockNumber) {
  const all = readAll();
  all[key(chain, address)] = blockNumber;
  fs.writeFileSync(config.stateFile, JSON.stringify(all, null, 2));
}
