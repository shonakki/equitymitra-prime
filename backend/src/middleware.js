const cors = require("cors");
const config = require("./config");

function corsMiddleware() {
  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // server-to-server / curl
      if (config.allowedOrigins.length === 0) return cb(null, true);
      if (config.allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed`));
    },
    credentials: false,
  });
}

function requireFrontendKey(req, res, next) {
  if (!config.frontendSharedSecret) return next();
  const key = req.header("x-em-key");
  if (key && key === config.frontendSharedSecret) return next();
  return res.status(401).json({ ok: false, error: "Unauthorized" });
}

function errorHandler(err, _req, res, _next) {
  console.error("[error]", err.message);
  const status = err.response?.status || 500;
  res.status(status >= 400 && status < 600 ? status : 500).json({
    ok: false,
    error: err.message || "Internal error",
  });
}

module.exports = { corsMiddleware, requireFrontendKey, errorHandler };
