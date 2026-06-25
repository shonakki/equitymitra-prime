"use strict";

const requireAuth = require("./requireAuth");

/**
 * Admin-only middleware.
 * Must be used AFTER requireAuth (relies on req.user.isAdmin).
 */
function requireAdmin(req, res, next) {
  // First ensure authenticated
  requireAuth(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ ok: false, error: "Admin access required" });
    }
    next();
  });
}

module.exports = requireAdmin;
