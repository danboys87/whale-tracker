// alertLogger.js
import fs from "fs";
import path from "path";
import { config } from "./config.js";

function ensureDir() {
  const dir = path.dirname(config.alertsLogFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readAlerts() {
  try {
    return JSON.parse(fs.readFileSync(config.alertsLogFile, "utf-8"));
  } catch {
    return [];
  }
}

export function logAlert(alert) {
  ensureDir();
  const alerts = readAlerts();
  alerts.unshift({ ...alert, loggedAt: new Date().toISOString() });
  const trimmed = alerts.slice(0, config.maxAlertsStored);
  fs.writeFileSync(config.alertsLogFile, JSON.stringify(trimmed, null, 2));
}

export function getAlerts() {
  return readAlerts();
}

export function clearAlerts() {
  ensureDir();
  fs.writeFileSync(config.alertsLogFile, JSON.stringify([], null, 2));
}
