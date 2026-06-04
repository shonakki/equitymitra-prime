/**
 * Angel One market data helpers.
 * Uses the LTP / Quote endpoint:
 *   POST /rest/secure/angelbroking/market/v1/quote/
 *   body: { mode: "FULL" | "OHLC" | "LTP", exchangeTokens: { NSE: ["..."], NFO: [...] } }
 *
 * Token map for indices and common stocks. Extend as needed
 * (or load from Angel's scrip master JSON).
 */
const { angelPost } = require("./session");

const fs = require("fs");
const path = require("path");

let tokensJson = {};
try {
  const tokensPath = path.join(__dirname, "tokens.json");
  if (fs.existsSync(tokensPath)) {
    tokensJson = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));
  }
} catch (e) {
  console.error("[market] Failed to load tokens.json:", e.message);
}

// NSE indices and common F&O stock tokens (verify against Angel scrip master).
const TOKENS = {
  NIFTY: { exchange: "NSE", token: "99926000", symbol: "NIFTY 50" },
  BANKNIFTY: { exchange: "NSE", token: "99926009", symbol: "NIFTY BANK" },
  FINNIFTY: { exchange: "NSE", token: "99926037", symbol: "NIFTY FIN SERVICE" },
  SENSEX: { exchange: "BSE", token: "99919000", symbol: "SENSEX" },
  ...tokensJson
};

const DEFAULT_WATCHLIST = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "TATAMOTORS", "ADANIENT", "LT",
];

function groupTokens(keys) {
  const exchangeTokens = {};
  const meta = [];
  for (const k of keys) {
    const t = TOKENS[k.toUpperCase()];
    if (!t) continue;
    exchangeTokens[t.exchange] = exchangeTokens[t.exchange] || [];
    exchangeTokens[t.exchange].push(t.token);
    meta.push({ key: k.toUpperCase(), ...t });
  }
  return { exchangeTokens, meta };
}

async function fetchQuote(keys, mode = "FULL") {
  const { exchangeTokens, meta } = groupTokens(keys);
  if (!meta.length) return { fetched: [], data: [] };

  const res = await angelPost("/rest/secure/angelbroking/market/v1/quote/", {
    mode,
    exchangeTokens,
  });

  const fetched = res?.data?.fetched || [];
  const merged = meta.map((m) => {
    const row = fetched.find(
      (f) => String(f.symbolToken) === String(m.token) && f.exchange === m.exchange
    );
    return {
      key: m.key,
      symbol: m.symbol,
      exchange: m.exchange,
      token: m.token,
      ltp: row?.ltp ?? null,
      open: row?.open ?? null,
      high: row?.high ?? null,
      low: row?.low ?? null,
      close: row?.close ?? null,
      netChange: row?.netChange ?? null,
      percentChange: row?.percentChange ?? null,
      volume: row?.tradeVolume ?? null,
      raw: row || null,
    };
  });
  return { fetched: merged, data: merged };
}

module.exports = { fetchQuote, TOKENS, DEFAULT_WATCHLIST };
