"use strict";
const jwt  = require("jsonwebtoken");
const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET || "change-me-in-production-equitymitra-2025";
const EXPIRY = "7d";

/**
 * Sign a JWT containing user info + plan (plan is signed → tamper-proof).
 */
function signToken(user) {
  return jwt.sign(
    {
      sub:     String(user.id),
      phone:   user.phone  || null,
      email:   user.email  || null,
      name:    user.name,
      plan:    user.plan,
      isAdmin: !!user.is_admin,
    },
    SECRET,
    { expiresIn: EXPIRY }
  );
}

/**
 * Verify and decode a JWT. Returns payload or throws.
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Hash a token for session storage (never store raw JWT in DB).
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { signToken, verifyToken, hashToken };
