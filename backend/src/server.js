const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");
const rateLimit = require("express-rate-limit");
const http    = require("http");
const { WebSocketServer } = require("ws");

const config       = require("./config");
const { corsMiddleware, errorHandler } = require("./middleware");
const marketRoutes  = require("./routes/market");
const authRoutes    = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const adminRoutes   = require("./routes/admin");
const notifyRoutes  = require("./routes/notify");
const { ensureSession } = require("./angel/session");
const smartstream  = require("./angel/smartstream");

// Initialise database (runs schema migrations on startup)
require("./db");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(corsMiddleware());

// Raw body needed for Razorpay webhook signature verification
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "100kb" }));
app.use(morgan("tiny"));

// Rate limits
const apiLimiter = rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 60_000, max: 20,  standardHeaders: true, legacyHeaders: false, message: { ok: false, error: "Too many requests" } });

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth",    authLimiter, authRoutes);
app.use("/api/payment", apiLimiter,  paymentRoutes);
app.use("/api/admin",   apiLimiter,  adminRoutes);
app.use("/api/notify",  apiLimiter,  notifyRoutes);
app.use("/api",         apiLimiter,  marketRoutes);

app.use((req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// ─── HTTP + WebSocket server ──────────────────────────────────────────────────

const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: "/ws" });

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
  clientWs.send(
    JSON.stringify({
      type: "snapshot",
      data: {
        NIFTY:     smartstream.getCandles("NIFTY"),
        BANKNIFTY: smartstream.getCandles("BANKNIFTY"),
      },
    })
  );
});

smartstream.subscribe((payload) => broadcast(payload));

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(config.port, async () => {
  console.log(`[server] listening on :${config.port}`);
  try {
    await ensureSession();
  } catch (e) {
    console.warn("[server] initial Angel login deferred:", e.message);
  }
  smartstream.connect().catch((e) =>
    console.warn("[smartstream] initial connect:", e.message)
  );
});
