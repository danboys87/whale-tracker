// addressStore.js
import fs from "fs";

const FILE = "./addresses.json";

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

export function getAddresses() {
  return readAll();
}

export function addAddress({ address, label }) {
  if (!address || !label) throw new Error("address dan label wajib diisi");
  const list = readAll();
  const normalized = address.toLowerCase();

  if (list.some((a) => a.address === normalized)) {
    throw new Error("Address sudah ada di daftar");
  }

  const entry = { address: normalized, label, addedAt: new Date().toISOString() };
  list.push(entry);
  writeAll(list);
  return entry;
}

export function removeAddress(address) {
  const list = readAll();
  const filtered = list.filter((a) => a.address !== address.toLowerCase());
  writeAll(filtered);
  return filtered.length !== list.length;
}

// Lookup cepat: { "0xabc...": "Binance 14" }
export function getAddressMap() {
  const map = {};
  for (const a of readAll()) map[a.address] = a.label;
  return map;
}
