// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { getAlerts, clearAlerts } from "./alertLogger.js";
import { getAddresses, addAddress, removeAddress } from "./addressStore.js";
import { getTokens, addToken, removeToken } from "./tokenStore.js";
import { lookupToken } from "./priceClient.js";
import { listChains } from "./chains.js";
import { getSettings, updateSettings } from "./settingsStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function startDashboardServer() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  });

  app.get("/api/alerts", (req, res) => {
    res.json(getAlerts());
  });

  app.delete("/api/alerts", (req, res) => {
    clearAlerts();
    res.status(204).end();
  });

  app.get("/api/addresses", (req, res) => {
    res.json(getAddresses());
  });

  app.post("/api/addresses", (req, res) => {
    try {
      res.status(201).json(addAddress(req.body));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/addresses/:address", (req, res) => {
    const removed = removeAddress(req.params.address);
    if (!removed) return res.status(404).json({ error: "Address tidak ditemukan" });
    res.status(204).end();
  });

  app.get("/api/tokens", (req, res) => {
    res.json(getTokens());
  });

  app.post("/api/tokens", (req, res) => {
    try {
      res.status(201).json(addToken(req.body));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/tokens/:chain/:address", (req, res) => {
    const removed = removeToken(req.params.address, req.params.chain);
    if (!removed) return res.status(404).json({ error: "Token tidak ditemukan" });
    res.status(204).end();
  });

  // Auto-detect chain + simbol dari address saja (dipakai form Tambah Token)
  app.get("/api/tokens/lookup", async (req, res) => {
    const address = req.query.address;
    if (!address) return res.status(400).json({ error: "Parameter address wajib diisi" });

    try {
      const result = await lookupToken(address);
      if (!result) return res.status(404).json({ error: "Token tidak ditemukan" });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/chains", (req, res) => {
    res.json(listChains());
  });

  app.get("/api/settings", (req, res) => {
    res.json(getSettings());
  });

  app.post("/api/settings", (req, res) => {
    try {
      res.json(updateSettings(req.body));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.listen(config.port, () => {
    console.log(`Dashboard tersedia di http://localhost:${config.port}`);
  });
}
