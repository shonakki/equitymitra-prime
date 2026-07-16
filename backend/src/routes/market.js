const express = require("express");
const axios = require("axios");
const nseApi = require("../angel/nseApi");

const router = express.Router();

// Helper to map index keys to Yahoo Finance symbols
function getYahooSymbol(symbolKey) {
  const upper = symbolKey.toUpperCase();
  if (upper === "NIFTY") return "^NSEI";
  if (upper === "SENSEX") return "^BSESN";
  if (upper === "BANKNIFTY") return "^NSEBANK";
  if (upper === "FINNIFTY") return "^CNXFIN";
  return `${upper}.NS`;
}

// Fetch historical daily chart and current quote from Yahoo Finance
async function fetchYahooChart(symbolKey) {
  const ySymbol = getYahooSymbol(symbolKey);
  const encoded = encodeURIComponent(ySymbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1mo&interval=1d`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    timeout: 10000
  });

  const chart = res.data?.chart?.result?.[0];
  if (!chart) throw new Error(`No chart data returned for ${symbolKey}`);

  const meta = chart.meta;
  const timestamps = chart.timestamp || [];
  const indicators = chart.indicators?.quote?.[0] || {};
  const closes = indicators.close || [];

  const history = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) {
      history.push({
        date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
        close: parseFloat(closes[i].toFixed(2))
      });
    }
  }

  const ltp = meta.regularMarketPrice ?? (history.length > 0 ? history[history.length - 1].close : null);
  const prevClose = meta.chartPreviousClose ?? (history.length > 1 ? history[history.length - 2].close : ltp);
  const netChange = (ltp != null && prevClose != null) ? ltp - prevClose : 0;
  const percentChange = prevClose ? (netChange / prevClose) * 100 : 0;

  return {
    key: symbolKey.toUpperCase(),
    symbol: meta.symbol || symbolKey,
    exchange: "INDEX",
    token: null,
    ltp,
    open: meta.regularMarketOpen ?? null,
    high: meta.regularMarketDayHigh ?? null,
    low: meta.regularMarketDayLow ?? null,
    close: prevClose,
    netChange,
    percentChange,
    volume: meta.regularMarketVolume ?? null,
    history: history.slice(-30)
  };
}

// Cache responses for 5 minutes to comply with EOD/delayed policy
const indexCache = new Map();
const TTL = 5 * 60 * 1000;

async function getCachedIndex(symbolKey) {
  const key = symbolKey.toUpperCase();
  const cached = indexCache.get(key);
  if (cached && (Date.now() - cached.timestamp < TTL)) {
    return cached.data;
  }
  // Let errors propagate — no fake fallback
  const data = await fetchYahooChart(symbolKey);
  indexCache.set(key, { data, timestamp: Date.now() });
  return data;
}

// ─── Index Routes ──────────────────────────────────────────────────────────────

router.get("/nifty", async (req, res, next) => {
  try { res.json({ ok: true, data: await getCachedIndex("NIFTY") }); }
  catch (e) { next(e); }
});

router.get("/banknifty", async (req, res, next) => {
  try { res.json({ ok: true, data: await getCachedIndex("BANKNIFTY") }); }
  catch (e) { next(e); }
});

router.get("/finnifty", async (req, res, next) => {
  try { res.json({ ok: true, data: await getCachedIndex("FINNIFTY") }); }
  catch (e) { next(e); }
});

router.get("/sensex", async (req, res, next) => {
  try { res.json({ ok: true, data: await getCachedIndex("SENSEX") }); }
  catch (e) { next(e); }
});

router.get("/stock/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ ok: true, data: await getCachedIndex(symbol) });
  } catch (e) { next(e); }
});

// ─── IPO Calendar ──────────────────────────────────────────────────────────────
// Cached for 60 minutes inside nseApi itself

router.get("/ipo", async (req, res, next) => {
  try {
    const ipos = await nseApi.getIpoCalendar();
    res.json({ ok: true, data: { ipos, updatedAt: new Date().toISOString() } });
  } catch (e) { next(e); }
});

// ─── Legacy dashboard route (returns IPO only, no fake data) ───────────────────

router.get("/dashboard", async (req, res, next) => {
  try {
    const ipos = await nseApi.getIpoCalendar();
    res.json({ ok: true, data: { ipos, updatedAt: new Date().toISOString() } });
  } catch (e) { next(e); }
});

module.exports = router;
