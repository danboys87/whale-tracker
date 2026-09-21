// config.js
// Cuma yang benar-benar statis (butuh restart kalau berubah). Untuk
// API key, Telegram, dan threshold yang bisa diedit lewat dashboard,
// lihat settingsStore.js.
export const config = {
  stateFile: "./state.json",
  alertsLogFile: "./public/alerts.json",
  maxAlertsStored: 500,
  port: Number(process.env.PORT || 3000),
};
