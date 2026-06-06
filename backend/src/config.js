const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const required = ["ANGEL_API_KEY", "ANGEL_CLIENT_CODE", "ANGEL_PASSWORD", "ANGEL_TOTP_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length && process.env.NODE_ENV !== "test") {
  console.warn(`[config] Missing env vars: ${missing.join(", ")} — Angel calls will fail until set.`);
}

module.exports = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || "development",
  angel: {
    apiKey: process.env.ANGEL_API_KEY,
    clientCode: process.env.ANGEL_CLIENT_CODE,
    password: process.env.ANGEL_PASSWORD,
    totpSecret: process.env.ANGEL_TOTP_SECRET,
  },
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  frontendSharedSecret: process.env.FRONTEND_SHARED_SECRET || "",
  alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY || "",
};
