const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");
const rateLimit = require("express-rate-limit");
const http    = require("http");

const config       = require("./config");
const { corsMiddleware, errorHandler } = require("./middleware");
const marketRoutes  = require("./routes/market");
const authRoutes    = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const adminRoutes   = require("./routes/admin");
const notifyRoutes  = require("./routes/notify");
const researchRoutes = require("./routes/research");
const academyRoutes = require("./routes/academy");
const { ensureSession } = require("./angel/session");

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
app.use("/api/research", apiLimiter,  researchRoutes);
app.use("/api/academy", apiLimiter,  academyRoutes);
app.use("/api",         apiLimiter,  marketRoutes);

app.use((req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// ─── HTTP server ──────────────────────────────────────────────────

const server = http.createServer(app);

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(config.port, async () => {
  console.log(`[server] listening on :${config.port}`);
  try {
    await ensureSession();
  } catch (e) {
    console.warn("[server] initial Angel login deferred:", e.message);
  }
});
