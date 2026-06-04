const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { WebSocketServer } = require("ws");

const config = require("./config");
const { corsMiddleware, errorHandler } = require("./middleware");
const marketRoutes = require("./routes/market");
const { ensureSession } = require("./angel/session");
const smartstream = require("./angel/smartstream");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(corsMiddleware());
app.use(express.json({ limit: "100kb" }));
app.use(morgan("tiny"));

app.use(
  "/api",
  rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false })
);

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.use("/api", marketRoutes);
app.use((req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// ─── HTTP + WebSocket server ──────────────────────────────────────────────────

const server = http.createServer(app);

// WebSocket server at /ws — feeds real-time ticks to frontend clients
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1 /* OPEN */) {
      try { client.send(msg); } catch {}
    }
  }
}

wss.on("connection", (clientWs) => {
  console.log("[ws] frontend connected, clients:", wss.clients.size);
  clientWs.on("error", () => {});

  // Send accumulated candle snapshot immediately on connect
  clientWs.send(
    JSON.stringify({
      type: "snapshot",
      data: {
        NIFTY: smartstream.getCandles("NIFTY"),
        BANKNIFTY: smartstream.getCandles("BANKNIFTY"),
      },
    })
  );
});

// Broadcast every SmartStream tick to all frontend WS clients
smartstream.subscribe((payload) => {
  broadcast(payload); // { type:"tick", symbol, ltp, candles }
});

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(config.port, async () => {
  console.log(`[server] listening on :${config.port}`);
  try {
    await ensureSession();
  } catch (e) {
    console.warn("[server] initial Angel login deferred:", e.message);
  }
  // Non-blocking — will retry internally on failure
  smartstream.connect().catch((e) =>
    console.warn("[smartstream] initial connect:", e.message)
  );
});
