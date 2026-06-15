const express = require("express");
const { fetchQuote, TOKENS } = require("../angel/market");
const { cleanSymbolKey, fetchStockDetails } = require("../angel/stockInfo");
const smartstream = require("../angel/smartstream");
const dashboard = require("../angel/dashboard");
const nseApi = require("../angel/nseApi");
const { getUSADashboardData } = require("../angel/usaDashboard");

const router = express.Router();

// Simple 3s in-memory cache to avoid hammering Angel.
const cache = new Map();
const TTL = 3000;
async function cached(key, fn, customTTL = TTL) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < customTTL) return hit.v;
  const v = await fn();
  cache.set(key, { v, t: Date.now() });
  return v;
}

function single(key) {
  return async (_req, res, next) => {
    try {
      const out = await cached(key, () => fetchQuote([key]));
      res.json({ ok: true, data: out.data[0] || null });
    } catch (e) { next(e); }
  };
}

router.get("/nifty", single("NIFTY"));
router.get("/banknifty", single("BANKNIFTY"));
router.get("/finnifty", single("FINNIFTY"));
router.get("/sensex", single("SENSEX"));


router.get("/stock/:symbol", async (req, res, next) => {
  try {
    const requested = req.params.symbol.toUpperCase();
    const symbolKey = cleanSymbolKey(requested);

    // Only return data for symbols in Angel One tokens
    if (!TOKENS[symbolKey]) {
      return res.status(404).json({ ok: false, error: `Symbol not supported: ${symbolKey}. Use /api/symbols for available symbols.` });
    }

    // Fetch quote from Angel One API (with caching)
    const out = await cached(`s:${symbolKey}`, () => fetchQuote([symbolKey]));
    const stock = out.data[0] || null;

    if (!stock) {
      return res.status(500).json({ ok: false, error: `Failed to retrieve data from Angel One API for ${symbolKey}` });
    }

    res.json({ ok: true, data: stock });
  } catch (e) { next(e); }
});

router.get("/symbols", (_req, res) => {
  res.json({ ok: true, data: Object.keys(TOKENS) });
});

/**
 * GET /api/candles/:symbol
 * Returns accumulated 1-min OHLC candles for NIFTY or BANKNIFTY.
 * Candles are built live from SmartStream ticks since server start.
 */
router.get("/candles/:symbol", (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const candles = smartstream.getCandles(sym);
  res.json({ ok: true, data: candles });
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const data = await cached("market_dashboard", async () => {
      const dash = await dashboard.getDashboardData();
      const ipos = await nseApi.getIpoCalendar();
      return { ...dash, ipos };
    }, 15000);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/dashboard/usa", async (req, res, next) => {
  try {
    const data = await cached("market_dashboard_usa", async () => {
      return await getUSADashboardData();
    }, 15000);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
