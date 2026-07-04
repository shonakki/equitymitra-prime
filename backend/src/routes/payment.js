"use strict";

/**
 * Payment Routes (Razorpay)
 * POST /api/payment/create-order  — Create Razorpay order
 * POST /api/payment/verify        — Verify signature + activate plan
 * GET  /api/payment/history       — User's payment history
 * POST /api/payment/webhook       — Razorpay webhook (failed/refunded events)
 */

const router      = require("express").Router();
const crypto      = require("crypto");
const db          = require("../db");
const { signToken, hashToken } = require("../lib/jwt");
const requireAuth = require("../middleware/requireAuth");

// ─── Plan config ──────────────────────────────────────────────────────────────
// amount in paise (INR × 100)
const PLAN_CONFIG = {
  Starter:        { amount: 19900,   currency: "INR", label: "Starter Monthly"      },
  Premium:        { amount: 59900,   currency: "INR", label: "Premium Monthly"       },
  PremiumYearly:  { amount: 499900,  currency: "INR", label: "Premium Yearly"        },
  BeginnerProgram:{ amount: 999900,  currency: "INR", label: "Beginner Academy"      },
  Founder:        { amount: 2100000, currency: "INR", label: "Founder Lifetime"      },
};

function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
  }

  const Razorpay = require("razorpay");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// ─── POST /api/payment/create-order ──────────────────────────────────────────
router.post("/create-order", requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!PLAN_CONFIG[planId]) {
      return res.status(400).json({ ok: false, error: "Invalid plan ID" });
    }

    const plan    = PLAN_CONFIG[planId];
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount:   plan.amount,
      currency: plan.currency,
      receipt:  `em_${req.user.sub}_${Date.now()}`,
      notes: {
        userId:  String(req.user.sub),
        planId,
        planLabel: plan.label,
      },
    });

    // Store order in DB
    db.prepare(
      `INSERT INTO payments (user_id, razorpay_order_id, plan, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, 'created')`
    ).run(req.user.sub, order.id, planId, plan.amount, plan.currency);

    res.json({
      ok:      true,
      orderId: order.id,
      keyId:   process.env.RAZORPAY_KEY_ID,
      amount:  plan.amount,
      currency: plan.currency,
      planLabel: plan.label,
    });
  } catch (err) {
    console.error("[payment/create-order]", err);
    if (err.message.includes("not configured")) {
      return res.status(503).json({ ok: false, error: "Payment gateway not configured" });
    }
    res.status(500).json({ ok: false, error: "Failed to create payment order" });
  }
});

// ─── POST /api/payment/create-report-order ────────────────────────────────────
router.post("/create-report-order", requireAuth, async (req, res) => {
  try {
    const { reportId } = req.body;
    if (!reportId) return res.status(400).json({ ok: false, error: "Missing report ID" });

    // Fetch report price
    const report = db.prepare("SELECT * FROM premium_research_cms WHERE id = ?").get(reportId);
    if (!report) return res.status(404).json({ ok: false, error: "Report not found" });

    const razorpay = getRazorpay();
    const amountInPaise = report.price * 100;

    const order = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: "INR",
      receipt:  `em_rep_${req.user.sub}_${Date.now()}`,
      notes: {
        userId:  String(req.user.sub),
        planId: `report_${report.id}`,
        planLabel: `Premium Report: ${report.title}`,
      },
    });

    db.prepare(
      `INSERT INTO payments (user_id, razorpay_order_id, plan, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, 'created')`
    ).run(req.user.sub, order.id, `report_${report.id}`, amountInPaise, "INR");

    res.json({
      ok:      true,
      orderId: order.id,
      keyId:   process.env.RAZORPAY_KEY_ID,
      amount:  amountInPaise,
      currency: "INR",
      planLabel: `Premium Report: ${report.title}`,
    });
  } catch (err) {
    console.error("[payment/create-report-order]", err);
    res.status(500).json({ ok: false, error: "Failed to create report payment order" });
  }
});

// ─── POST /api/payment/verify ─────────────────────────────────────────────────
router.post("/verify", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing payment verification data" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({ ok: false, error: "Payment gateway not configured" });
    }

    // Verify HMAC-SHA256 signature — NEVER trust frontend payment success
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("[payment/verify] Signature mismatch — possible tampering:", req.user.sub);
      db.prepare(
        `UPDATE payments SET status = 'failed', updated_at = datetime('now') WHERE razorpay_order_id = ?`
      ).run(razorpay_order_id);
      return res.status(400).json({ ok: false, error: "Payment verification failed. Contact support." });
    }

    // Fetch stored order
    const payment = db
      .prepare("SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?")
      .get(razorpay_order_id, req.user.sub);

    if (!payment) {
      return res.status(404).json({ ok: false, error: "Order not found" });
    }

    if (payment.status === "paid") {
      return res.status(409).json({ ok: false, error: "Payment already processed" });
    }

    // Update payment record
    db.prepare(
      `UPDATE payments
       SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'paid', updated_at = datetime('now')
       WHERE id = ?`
    ).run(razorpay_payment_id, razorpay_signature, payment.id);

    // Activate plan on user or unlock report
    if (payment.plan.startsWith("report_")) {
      const reportId = parseInt(payment.plan.replace("report_", ""), 10);
      try {
        db.prepare(
          "INSERT INTO premium_purchases (user_id, report_id, razorpay_order_id) VALUES (?, ?, ?)"
        ).run(req.user.sub, reportId, razorpay_order_id);
      } catch (e) {
        if (!e.message.includes("UNIQUE constraint")) throw e;
      }
      console.log(`[payment] User ${req.user.sub} purchased report: ${reportId}`);
      
      // Do NOT issue new token since plan didn't change
      return res.json({
        ok: true,
        reportId,
        message: "Report unlocked successfully"
      });
    } else {
      db.prepare(
        "UPDATE users SET plan = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(payment.plan, req.user.sub);

      // Issue fresh JWT with updated plan
      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
      const newToken    = signToken(updatedUser);

      // Create new session for the new token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      db.prepare(
        "INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
      ).run(updatedUser.id, hashToken(newToken), expiresAt);

      console.log(`[payment] User ${req.user.sub} activated plan: ${payment.plan}`);

      res.json({
        ok:    true,
        token: newToken,
        plan:  payment.plan,
        user: {
          id:    updatedUser.id,
          phone: updatedUser.phone,
          email: updatedUser.email,
          name:  updatedUser.name,
          plan:  updatedUser.plan,
        },
      });
    }
  } catch (err) {
    console.error("[payment/verify]", err);
    res.status(500).json({ ok: false, error: "Payment verification failed" });
  }
});

// ─── GET /api/payment/history ─────────────────────────────────────────────────
router.get("/history", requireAuth, (req, res) => {
  try {
    const payments = db
      .prepare(
        `SELECT id, plan, amount, currency, status, created_at, razorpay_payment_id
         FROM payments
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`
      )
      .all(req.user.sub);

    res.json({ ok: true, data: payments });
  } catch (err) {
    console.error("[payment/history]", err);
    res.status(500).json({ ok: false, error: "Failed to fetch history" });
  }
});

// ─── POST /api/payment/webhook ────────────────────────────────────────────────
// Razorpay sends events here for failed/refunded payments
router.post("/webhook", (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-razorpay-signature"];
      const body      = JSON.stringify(req.body);
      const expected  = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
      if (signature !== expected) {
        return res.status(400).json({ ok: false, error: "Invalid webhook signature" });
      }
    }

    const event = req.body;
    if (event.event === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        db.prepare(
          "UPDATE payments SET status = 'failed', updated_at = datetime('now') WHERE razorpay_order_id = ?"
        ).run(orderId);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[payment/webhook]", err);
    res.status(500).json({ ok: false, error: "Webhook processing failed" });
  }
});

module.exports = router;
