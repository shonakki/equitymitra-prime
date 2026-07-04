"use strict";

const { verifyToken, hashToken } = require("../lib/jwt");
const db = require("../db");

/**
 * Express middleware — checks for a valid JWT Bearer token optionally.
 * If valid, attaches decoded payload as req.user.
 * If missing or invalid, proceeds without failing.
 */
function requireAuthOptional(req, res, next) {
  try {
    const header = req.headers["authorization"] || "";
    let token  = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);

    // Check session in DB
    const tokenHash = hashToken(token);
    const now       = new Date().toISOString();
    const session   = db
      .prepare("SELECT id FROM user_sessions WHERE token_hash = ? AND expires_at > ?")
      .get(tokenHash, now);

    if (session) {
      req.user = payload;
    }
    
    next();
  } catch (err) {
    // Fail silently in optional auth
    next();
  }
}

module.exports = requireAuthOptional;
