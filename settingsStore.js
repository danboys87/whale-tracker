// settingsStore.js
// Setting yang bisa diubah langsung dari dashboard (tab Config), tersimpan
// di settings.json. Nilai awal diambil dari .env sebagai default kalau
// settings.json belum ada / field-nya kosong.
import fs from "fs";

const FILE = "./settings.json";

const DEFAULTS = {
  explorerApiKey: process.env.EXPLORER_API_KEY || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  minUsdValue: Number(process.env.MIN_USD_VALUE || 50000),
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 90_000),
};

function readFile() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function getSettings() {
  return { ...DEFAULTS, ...readFile() };
}

export function updateSettings(partial) {
  const current = getSettings();
  const next = { ...current };

  if (partial.explorerApiKey !== undefined) next.explorerApiKey = String(partial.explorerApiKey).trim();
  if (partial.telegramBotToken !== undefined) next.telegramBotToken = String(partial.telegramBotToken).trim();
  if (partial.telegramChatId !== undefined) next.telegramChatId = String(partial.telegramChatId).trim();

  if (partial.minUsdValue !== undefined) {
    const n = Number(partial.minUsdValue);
    if (!Number.isFinite(n) || n <= 0) throw new Error("minUsdValue harus angka positif");
    next.minUsdValue = n;
  }

  if (partial.pollIntervalMs !== undefined) {
    const n = Number(partial.pollIntervalMs);
    if (!Number.isFinite(n) || n < 5000) throw new Error("pollIntervalMs minimal 5000 (5 detik)");
    next.pollIntervalMs = n;
  }

  fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
  return next;
}
