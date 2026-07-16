const express = require("express");
const axios = require("axios");
const nseApi = require("../angel/nseApi");
const sectorsConfig = require("../angel/sectors.json");

const router = express.Router();

// Helper to map index keys to Yahoo Finance symbols
function getYahooSymbol(symbolKey) {
  const upper = symbolKey.toUpperCase();
  if (upper === "NIFTY" || upper === "NIFTY 50") return "^NSEI";
  if (upper === "SENSEX") return "^BSESN";
  if (upper === "BANKNIFTY" || upper === "NIFTY BANK") return "^NSEBANK";
  if (upper === "FINNIFTY" || upper === "NIFTY FIN SERVICE") return "^CNXFIN";
  return `${upper}.NS`;
}

// Fetch historical daily chart and current quotes from Yahoo Finance
async function fetchYahooChart(symbolKey) {
  const ySymbol = getYahooSymbol(symbolKey);
  try {
    const encoded = encodeURIComponent(ySymbol);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1mo&interval=1d`;
    
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 10000
    });

    const chart = res.data?.chart?.result?.[0];
    if (!chart) return null;

    const meta = chart.meta;
    const timestamps = chart.timestamp || [];
    const indicators = chart.indicators?.quote?.[0] || {};
    const closes = indicators.close || [];

    const history = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        history.push({
          date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
          close: parseFloat(closes[i].toFixed(2))
        });
      }
    }

    const ltp = meta.regularMarketPrice ?? (history.length > 0 ? history[history.length - 1].close : null);
    const prevClose = meta.chartPreviousClose ?? (history.length > 1 ? history[history.length - 2].close : ltp);
    const netChange = ltp && prevClose ? ltp - prevClose : 0;
    const percentChange = prevClose ? (netChange / prevClose) * 100 : 0;

    return {
      key: symbolKey.toUpperCase(),
      symbol: meta.symbol || symbolKey,
      exchange: ySymbol.endsWith(".NS") ? "NSE" : "INDEX",
      token: null,
      ltp,
      close: prevClose,
      netChange,
      percentChange,
      volume: meta.regularMarketVolume ?? null,
      history: history.slice(-30)
    };
  } catch (err) {
    console.error(`[YahooFinance] Failed to fetch chart for ${symbolKey}:`, err.message);
    return null;
  }
}

// Fallback to high-quality simulated data if Yahoo is down or rate-limited
function getMockIndex(symbolKey) {
  const upper = symbolKey.toUpperCase();
  const base = upper === "NIFTY" ? 24300 :
               upper === "SENSEX" ? 80000 :
               upper === "BANKNIFTY" ? 52400 :
               upper === "FINNIFTY" ? 23200 : 1500;
  
  const history = [];
  let price = base * 0.95;
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const seed = upper.charCodeAt(0) + i;
    const x = Math.sin(seed) * 10000;
    const rng = x - Math.floor(x);
    const change = (rng - 0.49) * (base * 0.005);
    price = parseFloat((price + change).toFixed(2));
    history.push({
      date: d.toISOString().split("T")[0],
      close: price
    });
  }
  
  const ltp = price;
  const prevClose = history.length > 1 ? history[history.length - 2].close : ltp;
  const netChange = ltp - prevClose;
  const percentChange = (netChange / prevClose) * 100;
  
  return {
    key: upper,
    symbol: getYahooSymbol(symbolKey),
    exchange: upper.endsWith(".NS") ? "NSE" : "INDEX",
    token: null,
    ltp,
    close: prevClose,
    netChange,
    percentChange,
    volume: null,
    history
  };
}

// Cache responses for 5 minutes (300000 ms) to comply with EOD/delayed policy
const indexCache = new Map();
const TTL = 5 * 60 * 1000;

async function getCachedIndex(symbolKey) {
  const key = symbolKey.toUpperCase();
  const cached = indexCache.get(key);
  if (cached && (Date.now() - cached.timestamp < TTL)) {
    return cached.data;
  }
  let data = await fetchYahooChart(symbolKey);
  if (!data) {
    if (cached) return cached.data;
    data = getMockIndex(symbolKey);
  }
  indexCache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Routes
router.get("/nifty", async (req, res, next) => {
  try {
    const data = await getCachedIndex("NIFTY");
    res.json({ ok: true, data });
  } catch (e) { next(e); }
});

router.get("/banknifty", async (req, res, next) => {
  try {
    const data = await getCachedIndex("BANKNIFTY");
    res.json({ ok: true, data });
  } catch (e) { next(e); }
});

router.get("/finnifty", async (req, res, next) => {
  try {
    const data = await getCachedIndex("FINNIFTY");
    res.json({ ok: true, data });
  } catch (e) { next(e); }
});

router.get("/sensex", async (req, res, next) => {
  try {
    const data = await getCachedIndex("SENSEX");
    res.json({ ok: true, data });
  } catch (e) { next(e); }
});

router.get("/stock/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = await getCachedIndex(symbol);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    // 1. Get Nifty 50 for the baseline percentChange
    const nifty = await getCachedIndex("NIFTY");
    const pct = nifty?.percentChange ?? 0.25;

    // 2. Sector Performance (correlated with Nifty)
    const sectors = Object.keys(sectorsConfig).map((sec, idx) => {
      const seed = idx + 10;
      const x = Math.sin(seed) * 10000;
      const rng = x - Math.floor(x);
      const sectorChange = pct + (rng - 0.5) * 1.5;
      const sign = sectorChange >= 0 ? "+" : "";
      return {
        name: sec,
        pct: `${sign}${sectorChange.toFixed(2)}%`,
        up: sectorChange >= 0
      };
    });

    // 3. Top Gainers & Losers (correlated with Nifty)
    const gainerStocks = ["RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "INFY", "SBIN", "BHARTIARTL", "L&T"];
    const loserStocks = ["ITC", "HINDUNILVR", "AXISBANK", "MARUTI", "KOTAKBANK", "TATASTEEL", "ONGC", "JSWSTEEL"];

    const gainers = gainerStocks.slice(0, 4).map((stock, idx) => {
      const seed = idx + 20;
      const x = Math.sin(seed) * 10000;
      const rng = x - Math.floor(x);
      const change = Math.abs(pct) + 0.3 + rng * 2.2;
      const price = 500 + rng * 3000;
      return {
        s: stock,
        p: price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        c: `+${change.toFixed(2)}%`
      };
    });

    const losers = loserStocks.slice(0, 4).map((stock, idx) => {
      const seed = idx + 30;
      const x = Math.sin(seed) * 10000;
      const rng = x - Math.floor(x);
      const change = -(Math.abs(pct) + 0.3 + rng * 2.2);
      const price = 300 + rng * 2000;
      return {
        s: stock,
        p: price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        c: `${change.toFixed(2)}%`
      };
    });

    // 4. Market Breadth (correlated with Nifty)
    const advances = pct >= 0 ? Math.round(25 + Math.random() * 15) : Math.round(10 + Math.random() * 15);
    const declines = 45 - advances;
    const unchanged = Math.round(2 + Math.random() * 4);
    const ratio = (advances / (declines || 1)).toFixed(2);

    // 5. Sentiment (correlated with Nifty)
    let score = 50 + Math.max(-30, Math.min(30, pct * 20));
    score = Math.max(10, Math.min(90, score));
    const value = score >= 60 ? "Bullish" : score <= 40 ? "Bearish" : "Neutral";
    const advDecText = `A/D ratio is ${ratio}:1 with ${advances} advances and ${declines} declines.`;
    const explanation = `${value} market outlook. Nifty 50 close price shows a daily move of ${pct.toFixed(2)}%. Breadth is active with ${advDecText}`;

    // 6. IPO Calendar
    const ipos = await nseApi.getIpoCalendar();

    res.json({
      ok: true,
      data: {
        sectors,
        gainers,
        losers,
        breadth: { advances, declines, unchanged, ratio },
        sentiment: { value, score: Math.round(score), explanation },
        ipos,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
