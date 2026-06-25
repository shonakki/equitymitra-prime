"use strict";

/**
 * Admin CMS Routes
 * All routes require requireAdmin middleware.
 *
 * GET  /api/admin/stats
 * GET  /api/admin/users        + PATCH /:id + DELETE /:id
 * GET  /api/admin/payments
 * CRUD /api/admin/trades
 * CRUD /api/admin/videos
 * CRUD /api/admin/pdfs
 * CRUD /api/admin/announcements
 */

const router       = require("express").Router();
const db           = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// Apply admin guard to ALL routes in this router
router.use(requireAdmin);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function paginate(req) {
  const page  = Math.max(1, parseInt(req.query.page  || "1",  10));
  const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
  return { limit, offset: (page - 1) * limit, page };
}

function crudRouter(table, allowedFields) {
  const r = require("express").Router({ mergeParams: true });

  // LIST
  r.get("/", (req, res) => {
    try {
      const { limit, offset } = paginate(req);
      const search   = req.query.search ? `%${req.query.search}%` : null;
      const status   = req.query.status || null;
      const conditions = [];
      const params   = [];

      if (status) { conditions.push("status = ?"); params.push(status); }
      if (search)  { conditions.push("(title LIKE ? OR description LIKE ?)"); params.push(search, search); }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const total = db.prepare(`SELECT COUNT(*) as cnt FROM ${table} ${where}`).get(...params).cnt;
      const rows  = db.prepare(`SELECT * FROM ${table} ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
                      .all(...params, limit, offset);

      res.json({ ok: true, data: rows, total, page: Math.ceil(offset / limit) + 1, limit });
    } catch (err) {
      console.error(`[admin/${table} GET]`, err);
      res.status(500).json({ ok: false, error: "Failed" });
    }
  });

  // GET SINGLE
  r.get("/:id", (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, data: row });
  });

  // CREATE
  r.post("/", (req, res) => {
    try {
      const fields = allowedFields.filter((f) => f in req.body);
      if (!fields.length) return res.status(400).json({ ok: false, error: "No valid fields provided" });
      const cols   = fields.join(", ");
      const phs    = fields.map(() => "?").join(", ");
      const vals   = fields.map((f) => req.body[f]);
      const result = db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${phs})`).run(...vals);
      const row    = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid);
      res.status(201).json({ ok: true, data: row });
    } catch (err) {
      console.error(`[admin/${table} POST]`, err);
      res.status(500).json({ ok: false, error: "Failed to create" });
    }
  });

  // UPDATE
  r.patch("/:id", (req, res) => {
    try {
      const fields = allowedFields.filter((f) => f in req.body);
      if (!fields.length) return res.status(400).json({ ok: false, error: "No valid fields provided" });
      const sets = fields.map((f) => `${f} = ?`).join(", ");
      const vals = [...fields.map((f) => req.body[f]), req.params.id];
      db.prepare(`UPDATE ${table} SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...vals);
      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (!row) return res.status(404).json({ ok: false, error: "Not found" });
      res.json({ ok: true, data: row });
    } catch (err) {
      console.error(`[admin/${table} PATCH]`, err);
      res.status(500).json({ ok: false, error: "Failed to update" });
    }
  });

  // DELETE
  r.delete("/:id", (req, res) => {
    try {
      const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
      if (!result.changes) return res.status(404).json({ ok: false, error: "Not found" });
      res.json({ ok: true });
    } catch (err) {
      console.error(`[admin/${table} DELETE]`, err);
      res.status(500).json({ ok: false, error: "Failed to delete" });
    }
  });

  // BULK ACTIONS
  r.post("/bulk", (req, res) => {
    try {
      const { action, ids } = req.body;
      if (!Array.isArray(ids) || !ids.length) {
        return res.status(400).json({ ok: false, error: "ids array required" });
      }
      const phs = ids.map(() => "?").join(",");
      if (action === "delete") {
        db.prepare(`DELETE FROM ${table} WHERE id IN (${phs})`).run(...ids);
      } else if (["published", "draft", "archived"].includes(action)) {
        db.prepare(`UPDATE ${table} SET status = ?, updated_at = datetime('now') WHERE id IN (${phs})`).run(action, ...ids);
      } else {
        return res.status(400).json({ ok: false, error: "Unknown action" });
      }
      res.json({ ok: true, affected: ids.length });
    } catch (err) {
      console.error(`[admin/${table} BULK]`, err);
      res.status(500).json({ ok: false, error: "Bulk action failed" });
    }
  });

  return r;
}

// ─── Stats Dashboard ──────────────────────────────────────────────────────────
router.get("/stats", (req, res) => {
  try {
    const totalUsers    = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
    const totalPayments = db.prepare("SELECT COUNT(*) as c FROM payments WHERE status = 'paid'").get().c;
    const totalRevenue  = db.prepare("SELECT SUM(amount) as s FROM payments WHERE status = 'paid'").get().s || 0;
    const planBreakdown = db.prepare(
      "SELECT plan, COUNT(*) as cnt FROM users GROUP BY plan ORDER BY cnt DESC"
    ).all();
    const recentPayments = db.prepare(
      `SELECT p.id, p.plan, p.amount, p.status, p.created_at, u.phone, u.email
       FROM payments p JOIN users u ON p.user_id = u.id
       WHERE p.status = 'paid'
       ORDER BY p.created_at DESC LIMIT 10`
    ).all();

    res.json({
      ok: true,
      data: {
        totalUsers,
        totalPayments,
        totalRevenue: totalRevenue / 100, // convert paise → rupees
        planBreakdown,
        recentPayments,
      },
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/users", (req, res) => {
  try {
    const { limit, offset, page } = paginate(req);
    const search = req.query.search ? `%${req.query.search}%` : null;
    const plan   = req.query.plan   || null;
    const conds  = []; const params = [];

    if (plan)   { conds.push("plan = ?"); params.push(plan); }
    if (search) { conds.push("(phone LIKE ? OR email LIKE ? OR name LIKE ?)"); params.push(search, search, search); }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const total = db.prepare(`SELECT COUNT(*) as cnt FROM users ${where}`).get(...params).cnt;
    const rows  = db.prepare(
      `SELECT id, phone, email, name, plan, is_admin, created_at FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    res.json({ ok: true, data: rows, total, page, limit });
  } catch (err) {
    console.error("[admin/users GET]", err);
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

router.patch("/users/:id", (req, res) => {
  try {
    const { name, plan, is_admin } = req.body;
    const allowed = { name, plan, is_admin };
    const fields  = Object.entries(allowed).filter(([, v]) => v !== undefined);
    if (!fields.length) return res.status(400).json({ ok: false, error: "No fields" });
    const sets = fields.map(([k]) => `${k} = ?`).join(", ");
    const vals = [...fields.map(([, v]) => v), req.params.id];
    db.prepare(`UPDATE users SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...vals);
    const user = db.prepare("SELECT id, phone, email, name, plan, is_admin FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, data: user });
  } catch (err) {
    console.error("[admin/users PATCH]", err);
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

router.delete("/users/:id", (req, res) => {
  try {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    if (!result.changes) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

// ─── Payments ─────────────────────────────────────────────────────────────────
router.get("/payments", (req, res) => {
  try {
    const { limit, offset, page } = paginate(req);
    const status = req.query.status || null;
    const conds  = []; const params = [];
    if (status) { conds.push("p.status = ?"); params.push(status); }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const total = db.prepare(`SELECT COUNT(*) as cnt FROM payments p ${where}`).get(...params).cnt;
    const rows  = db.prepare(
      `SELECT p.*, u.phone, u.email, u.name
       FROM payments p JOIN users u ON p.user_id = u.id
       ${where}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);
    res.json({ ok: true, data: rows, total, page, limit });
  } catch (err) {
    console.error("[admin/payments]", err);
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

// ─── CMS Modules ─────────────────────────────────────────────────────────────
router.use("/trades",        crudRouter("trades_cms",   ["symbol","exchange","category","side","setup","entry","target1","target2","stop_loss","risk_level","potential","notes","status"]));
router.use("/videos",        crudRouter("videos_cms",   ["title","description","url","thumbnail","duration","category","required_plan","release_month","sort_order","status"]));
router.use("/pdfs",          crudRouter("pdfs_cms",     ["title","description","url","category","required_plan","release_month","sort_order","status"]));
router.use("/announcements", crudRouter("announcements",["title","content","type","status"]));

// ─── Settings: notify emails list ─────────────────────────────────────────────
router.get("/notify-emails", (req, res) => {
  try {
    const { limit, offset } = paginate(req);
    const rows = db.prepare("SELECT * FROM notify_emails ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset);
    const total = db.prepare("SELECT COUNT(*) as c FROM notify_emails").get().c;
    res.json({ ok: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed" });
  }
});

module.exports = router;
