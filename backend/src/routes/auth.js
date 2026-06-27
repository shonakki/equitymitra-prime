"use strict";

/**
 * Auth Routes
 * POST /api/auth/send-otp      — Send OTP to phone or email
 * POST /api/auth/verify-otp    — Verify OTP, return JWT
 * POST /api/auth/google        — Google ID token → login/register
 * POST /api/auth/logout        — Invalidate current session
 * POST /api/auth/logout-all    — Invalidate ALL sessions for user
 * GET  /api/auth/me            — Return current user from JWT
 */

const router  = require("express").Router();
const crypto  = require("crypto");
const db      = require("../db");
const { signToken, hashToken } = require("../lib/jwt");
const { sendOtp, sendEmailOtp } = require("../lib/sms");
const requireAuth = require("../middleware/requireAuth");
const config = require("../config");


// ─── Admin phone list ─────────────────────────────────────────────────────────
// Comma-separated phone numbers in ADMIN_PHONES env var
function isAdminPhone(phone) {
  const admins = (process.env.ADMIN_PHONES || "").split(",").map((s) => s.trim()).filter(Boolean);
  return admins.includes(phone);
}

// ─── OTP helpers ─────────────────────────────────────────────────────────────
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Rate limiting helpers ────────────────────────────────────────────────────
const OTP_RATE_WINDOW_MINUTES = 10;
const OTP_MAX_PER_WINDOW      = 3;

function checkOtpRateLimit(identifier) {
  const windowStart = new Date(Date.now() - OTP_RATE_WINDOW_MINUTES * 60_000).toISOString();
  const row = db
    .prepare("SELECT COUNT(*) as cnt FROM otps WHERE identifier = ? AND created_at > ?")
    .get(identifier, windowStart);
  return row.cnt < OTP_MAX_PER_WINDOW;
}

function createSession(userId, token, deviceInfo) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    "INSERT INTO user_sessions (user_id, token_hash, device_info, expires_at) VALUES (?, ?, ?, ?)"
  ).run(userId, hashToken(token), deviceInfo || null, expiresAt);
}

function getUserWithPlanUpdate(userId) {
  // If phone in ADMIN_PHONES, ensure is_admin=1
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user) return null;

  if (user.phone && isAdminPhone(user.phone) && !user.is_admin) {
    db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(userId);
    user.is_admin = 1;
  }
  return user;
}

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ ok: false, error: "Phone or email required" });
    }

    const identifier = phone
      ? phone.replace(/\D/g, "").slice(-10) // normalise to 10 digits
      : email.toLowerCase().trim();

    if (phone && !/^[6-9]\d{9}$/.test(identifier)) {
      return res.status(400).json({ ok: false, error: "Enter a valid 10-digit Indian mobile number" });
    }

    if (!checkOtpRateLimit(identifier)) {
      return res.status(429).json({ ok: false, error: "Too many OTP requests. Wait 10 minutes and try again." });
    }

    if (phone) {
      if (!process.env.MSG91_API_KEY || !process.env.MSG91_TEMPLATE_ID) {
        return res.status(503).json({
          ok: false,
          error: "Mobile OTP will be available shortly. Please use Google Login or Email OTP."
        });
      }
    }

    // Expire previous unused OTPs for this identifier
    db.prepare("UPDATE otps SET used = 1 WHERE identifier = ? AND used = 0").run(identifier);

    const otp       = generateOtp();
    const expiryMs  = phone ? 10 * 60_000 : 5 * 60_000;
    const expiresAt = new Date(Date.now() + expiryMs).toISOString();

    db.prepare(
      "INSERT INTO otps (identifier, code, expires_at) VALUES (?, ?, ?)"
    ).run(identifier, otp, expiresAt);

    if (phone) {
      await sendOtp(identifier, otp);
    } else {
      await sendEmailOtp(identifier, otp);
    }

    res.json({ ok: true, message: phone ? "OTP sent to your mobile" : "OTP sent to your email" });
  } catch (err) {
    console.error("[auth/send-otp]", err);
    res.status(500).json({ ok: false, error: "Failed to send OTP. Try again." });
  }
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, email, otp, deviceInfo } = req.body;

    if ((!phone && !email) || !otp) {
      return res.status(400).json({ ok: false, error: "Phone/email and OTP required" });
    }

    const identifier = phone
      ? phone.replace(/\D/g, "").slice(-10)
      : email.toLowerCase().trim();

    // Find latest unused valid OTP
    const now = new Date().toISOString();
    const record = db
      .prepare(
        "SELECT * FROM otps WHERE identifier = ? AND used = 0 AND expires_at > ? ORDER BY id DESC LIMIT 1"
      )
      .get(identifier, now);

    if (!record) {
      return res.status(400).json({ ok: false, error: "OTP expired. Request a new one." });
    }

    // Increment attempts
    db.prepare("UPDATE otps SET attempts = attempts + 1 WHERE id = ?").run(record.id);

    if (record.attempts >= 5) {
      db.prepare("UPDATE otps SET used = 1 WHERE id = ?").run(record.id);
      return res.status(400).json({ ok: false, error: "Too many incorrect attempts. Request a new OTP." });
    }

    if (record.code !== String(otp).trim()) {
      return res.status(400).json({ ok: false, error: "Incorrect OTP. Try again." });
    }

    // Mark OTP as used
    db.prepare("UPDATE otps SET used = 1 WHERE id = ?").run(record.id);

    // Upsert user
    let user;
    if (phone) {
      user = db.prepare("SELECT * FROM users WHERE phone = ?").get(identifier);
      if (!user) {
        const result = db
          .prepare("INSERT INTO users (phone, name, plan, is_admin) VALUES (?, ?, ?, ?)")
          .run(identifier, "Member", "Starter", isAdminPhone(identifier) ? 1 : 0);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      }
    } else {
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(identifier);
      if (!user) {
        const result = db
          .prepare("INSERT INTO users (email, name, plan) VALUES (?, ?, ?)")
          .run(identifier, "Member", "Starter");
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      }
    }

    // Auto-promote if ADMIN_PHONES includes this phone
    if (phone && isAdminPhone(identifier) && !user.is_admin) {
      db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(user.id);
      user.is_admin = 1;
    }

    const token = signToken(user);
    createSession(user.id, token, deviceInfo);

    res.json({
      ok:    true,
      token,
      user: {
        id:      user.id,
        phone:   user.phone,
        email:   user.email,
        name:    user.name,
        plan:    user.plan,
        isAdmin: !!user.is_admin,
      },
    });
  } catch (err) {
    console.error("[auth/verify-otp]", err);
    res.status(500).json({ ok: false, error: "Verification failed. Please try again." });
  }
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
router.post("/google", async (req, res) => {
  try {
    const { idToken, deviceInfo } = req.body;
    if (!idToken) return res.status(400).json({ ok: false, error: "Google ID token required" });

    const { OAuth2Client } = require("google-auth-library");
    const clientId = config.google.clientId;
    if (!clientId) {
      return res.status(503).json({ ok: false, error: "Google login not configured on this server" });
    }

    const client  = new OAuth2Client(clientId);
    const ticket  = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email    = payload.email?.toLowerCase();
    const name     = payload.name || "Member";

    // Upsert by google_id or email
    let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId);
    if (!user && email) {
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    }

    if (!user) {
      const result = db
        .prepare("INSERT INTO users (email, name, plan, google_id) VALUES (?, ?, ?, ?)")
        .run(email, name, "Starter", googleId);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    } else {
      // Link Google ID if not already linked
      if (!user.google_id) {
        db.prepare("UPDATE users SET google_id = ?, name = ? WHERE id = ?").run(googleId, name, user.id);
        user.google_id = googleId;
        user.name      = name;
      }
    }

    const token = signToken(user);
    createSession(user.id, token, deviceInfo);

    res.json({
      ok:    true,
      token,
      user: {
        id:      user.id,
        phone:   user.phone,
        email:   user.email,
        name:    user.name,
        plan:    user.plan,
        isAdmin: !!user.is_admin,
      },
    });
  } catch (err) {
    console.error("[auth/google]", err);
    res.status(401).json({ ok: false, error: "Google authentication failed" });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", requireAuth, (req, res) => {
  try {
    const header    = req.headers["authorization"] || "";
    const token     = header.startsWith("Bearer ") ? header.slice(7) : null;
    const tokenHash = token ? hashToken(token) : null;

    if (tokenHash) {
      db.prepare("DELETE FROM user_sessions WHERE token_hash = ?").run(tokenHash);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[auth/logout]", err);
    res.status(500).json({ ok: false, error: "Logout failed" });
  }
});

// ─── POST /api/auth/logout-all ────────────────────────────────────────────────
router.post("/logout-all", requireAuth, (req, res) => {
  try {
    db.prepare("DELETE FROM user_sessions WHERE user_id = ?").run(req.user.sub);
    res.json({ ok: true, message: "Logged out from all devices" });
  } catch (err) {
    console.error("[auth/logout-all]", err);
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    res.json({
      ok:   true,
      user: {
        id:        user.id,
        phone:     user.phone,
        email:     user.email,
        name:      user.name,
        plan:      user.plan,
        isAdmin:   !!user.is_admin,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

module.exports = router;
