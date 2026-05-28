const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const http = require("http");

const config = require("./config");
const { corsMiddleware, requireFrontendKey, errorHandler } = require("./middleware");
const marketRoutes = require("./routes/market");
const { ensureSession } = require("./angel/session");

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

// NOTE: requireFrontendKey temporarily disabled for local testing only.
// Re-enable before production deployment.
app.use("/api", marketRoutes);

app.use((req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

const server = http.createServer(app);

// WebSocket stub — wire Angel SmartStream here later using session.getFeedToken().
// const { WebSocketServer } = require("ws");
// const wss = new WebSocketServer({ server, path: "/ws" });
// wss.on("connection", (ws) => { ws.send(JSON.stringify({ ok: true, hello: "ws-ready" })); });

server.listen(config.port, async () => {
  console.log(`[server] listening on :${config.port}`);
  try {
    await ensureSession();
  } catch (e) {
    console.warn("[server] initial Angel login deferred:", e.message);
  }
});
