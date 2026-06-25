"use strict";

const router = require("express").Router();
const db     = require("../db");

/**
 * POST /api/notify/subscribe
 * Store email for trade-launch notification list.
 */
router.post("/subscribe", (req, res) => {
  try {
    const { email, feature } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email required" });
    }

    db.prepare(
      "INSERT OR IGNORE INTO notify_emails (email, feature) VALUES (?, ?)"
    ).run(email.toLowerCase().trim(), feature || "trades");

    res.json({ ok: true, message: "You'll be notified when Trade Recommendations launch!" });
  } catch (err) {
    console.error("[notify/subscribe]", err);
    res.status(500).json({ ok: false, error: "Failed to subscribe" });
  }
});

module.exports = router;
