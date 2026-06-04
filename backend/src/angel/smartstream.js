/**
 * Angel One SmartStream tick feed.
 *
 * Connects to wss://smartapisocket.angelone.in/smart-stream
 * Subscribes NIFTY 50 and BANK NIFTY in Snap-Quote (mode 3).
 * Parses binary frames → builds 1-min OHLC candles → notifies subscribers.
 *
 * Binary layout (Snap Quote, mode = 3):
 *   [0]      subscribe mode (u8)
 *   [1]      exchange type  (u8)
 *   [2-26]   token          (25 bytes ASCII, null-padded)
 *   [27-34]  sequence       (Int64LE)
 *   [35-42]  exchange ts    (Int64LE, seconds)
 *   [43-50]  LTP            (Int64LE, /100 = price)
 *   [51-58]  LTQ            (Int64LE)
 *   [59-66]  avg trade px   (Int64LE, /100)
 *   [67-74]  volume         (Int64LE)
 *   [75-82]  total buy qty  (Int64LE)
 *   [83-90]  total sell qty (Int64LE)
 *   [91-98]  open           (Int64LE, /100)
 *   [99-106] high           (Int64LE, /100)
 *   [107-114] low           (Int64LE, /100)
 *   [115-122] prev close    (Int64LE, /100)
 */

const WebSocket = require("ws");
const { ensureSession, getFeedToken } = require("./session");
const config = require("../config");

const ANGEL_WS_URL = "wss://smartapisocket.angelone.in/smart-stream";

// NSE index tokens → symbol name
const TOKEN_MAP = {
  "99926000": "NIFTY",
  "99926009": "BANKNIFTY",
};

// symbol → OHLCCandle[]  { time, open, high, low, close, volume }
const candleStore = new Map();
// symbol → latest raw tick
const latestTick = new Map();
// frontend WS broadcast subscribers
const subscribers = new Set();

let ws = null;
let reconnectTimer = null;

// ─── Binary parser ────────────────────────────────────────────────────────────

function parseBinary(raw) {
  try {
    const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
    if (buf.length < 51) return null;

    const mode = buf.readUInt8(0);
    const token = buf.slice(2, 27).toString("ascii").replace(/\x00/g, "").trim();

    // Exchange timestamp at offset 35 (seconds → ms)
    let ts = Number(buf.readBigInt64LE(35));
    if (ts > 0 && ts < 2_000_000_000_000) ts = ts * 1000; // seconds → ms
    if (ts <= 0) ts = Date.now();

    const ltp = Number(buf.readBigInt64LE(43)) / 100;
    if (!ltp || ltp <= 0) return null;

    // LTP-only mode or short frame
    if (mode !== 3 || buf.length < 120) {
      return { token, ltp, ts, open: null, high: null, low: null, volume: null };
    }

    const volume = Number(buf.readBigInt64LE(67));
    const open = Number(buf.readBigInt64LE(91)) / 100;
    const high = Number(buf.readBigInt64LE(99)) / 100;
    const low = Number(buf.readBigInt64LE(107)) / 100;

    return { token, ltp, ts, volume, open, high, low };
  } catch {
    return null;
  }
}

// ─── 1-minute candle builder ─────────────────────────────────────────────────

function updateCandles(symbol, { ltp, ts, volume }) {
  if (!candleStore.has(symbol)) candleStore.set(symbol, []);
  const candles = candleStore.get(symbol);
  const minuteTs = Math.floor(ts / 60_000) * 60_000;

  const last = candles[candles.length - 1];
  if (last && last.time === minuteTs) {
    last.close = ltp;
    if (ltp > last.high) last.high = ltp;
    if (ltp < last.low) last.low = ltp;
    if (volume != null) last.volume = volume;
  } else {
    // New 1-min bar
    candles.push({
      time: minuteTs,
      open: ltp,
      high: ltp,
      low: ltp,
      close: ltp,
      volume: volume ?? 0,
    });
    // Keep at most 390 bars (full 6.5h trading day)
    if (candles.length > 390) candles.shift();
  }
}

// ─── WebSocket connection ─────────────────────────────────────────────────────

async function connect() {
  if (ws) return;
  try {
    const sess = await ensureSession();
    const feedToken = getFeedToken();
    if (!feedToken) throw new Error("feedToken not available yet");

    ws = new WebSocket(ANGEL_WS_URL, {
      headers: {
        Authorization: `Bearer ${sess.jwt}`,
        "x-api-key": config.angel.apiKey,
        "x-client-code": config.angel.clientCode,
        "x-feed-token": feedToken,
      },
    });

    ws.on("open", () => {
      console.log("[smartstream] connected");
      // Subscribe to NIFTY + BANKNIFTY in Snap Quote mode
      ws.send(
        JSON.stringify({
          correlationID: "em1",
          action: 1, // subscribe
          params: {
            mode: 3, // Snap Quote (OHLCV + LTP)
            tokenList: [
              {
                exchangeType: 1, // NSE
                tokens: Object.keys(TOKEN_MAP),
              },
            ],
          },
        })
      );
    });

    // Heartbeat every 25 s to keep connection alive
    const hbInterval = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ correlationID: "em-hb", action: 0, params: {} }));
      }
    }, 25_000);

    ws.on("message", (raw) => {
      try {
        // Text frames are ACK / heartbeat — ignore
        if (typeof raw === "string") return;

        const tick = parseBinary(raw);
        if (!tick) return;

        const symbol = TOKEN_MAP[tick.token];
        if (!symbol) return;

        latestTick.set(symbol, tick);
        updateCandles(symbol, tick);

        const payload = {
          type: "tick",
          symbol,
          ltp: tick.ltp,
          candles: candleStore.get(symbol) ?? [],
        };
        for (const fn of subscribers) {
          try { fn(payload); } catch {}
        }
      } catch { /* swallow */ }
    });

    ws.on("error", (e) => console.warn("[smartstream] error:", e.message));

    ws.on("close", () => {
      ws = null;
      clearInterval(hbInterval);
      console.log("[smartstream] disconnected — reconnect in 5 s");
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, 5_000);
      }
    });
  } catch (e) {
    ws = null;
    console.warn("[smartstream] connect failed:", e.message, "— retry in 15 s");
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, 15_000);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

function getCandles(symbol) {
  return candleStore.get((symbol || "").toUpperCase()) ?? [];
}
function getLatestTick(symbol) {
  return latestTick.get((symbol || "").toUpperCase()) ?? null;
}
function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

module.exports = { connect, getCandles, getLatestTick, subscribe };
