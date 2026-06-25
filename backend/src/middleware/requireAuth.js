"use strict";

const { verifyToken, hashToken } = require("../lib/jwt");
const db = require("../db");

/**
 * Express middleware — requires a valid JWT Bearer token.
 * Attaches decoded payload as req.user.
 */
function requireAuth(req, res, next) {
  try {
    const header = req.headers["authorization"] || "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }

    const payload = verifyToken(token);

    // Check session is still valid in DB (allows server-side logout)
    const tokenHash = hashToken(token);
    const now       = new Date().toISOString();
    const session   = db
      .prepare("SELECT id FROM user_sessions WHERE token_hash = ? AND expires_at > ?")
      .get(tokenHash, now);

    if (!session) {
      return res.status(401).json({ ok: false, error: "Session expired. Please log in again." });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
