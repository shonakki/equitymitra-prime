/**
 * EquityMitra — SQLite Database Layer
 * Uses better-sqlite3 (synchronous API, perfect for Railway single-instance).
 * Database file is created next to server.js if DATA_DIR env is unset.
 */

"use strict";

const path  = require("path");
const fs    = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, "../../data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "equitymitra.db");
const db = new Database(DB_PATH);

// WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function ensureColumn(table, column, definition) {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all();
  if (existing.some((col) => col.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
}

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phone       TEXT    UNIQUE,
    email       TEXT    UNIQUE,
    name        TEXT    NOT NULL DEFAULT 'Member',
    plan        TEXT    NOT NULL DEFAULT 'Starter',
    is_admin    INTEGER NOT NULL DEFAULT 0,
    google_id   TEXT    UNIQUE,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS otps (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier  TEXT    NOT NULL,
    code        TEXT    NOT NULL,
    expires_at  TEXT    NOT NULL,
    used        INTEGER NOT NULL DEFAULT 0,
    attempts    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT    NOT NULL UNIQUE,
    device_info TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    expires_at  TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id    TEXT    UNIQUE,
    razorpay_payment_id  TEXT,
    razorpay_signature   TEXT,
    plan                 TEXT    NOT NULL,
    amount               INTEGER NOT NULL,
    currency             TEXT    NOT NULL DEFAULT 'INR',
    status               TEXT    NOT NULL DEFAULT 'created',
    created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notify_emails (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    feature     TEXT    NOT NULL DEFAULT 'trades',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- CMS: Trades (admin-only; hidden from public until SEBI registration)
  CREATE TABLE IF NOT EXISTS trades_cms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol      TEXT    NOT NULL,
    exchange    TEXT,
    category    TEXT,
    side        TEXT,
    setup       TEXT,
    entry       TEXT,
    target1     TEXT,
    target2     TEXT,
    stop_loss   TEXT,
    risk_level  TEXT,
    potential   TEXT,
    notes       TEXT,
    status      TEXT    NOT NULL DEFAULT 'draft',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- CMS: Videos
  CREATE TABLE IF NOT EXISTS videos_cms (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    description   TEXT,
    url           TEXT,
    thumbnail     TEXT,
    duration      TEXT,
    category      TEXT,
    required_plan TEXT    NOT NULL DEFAULT 'Premium',
    release_month INTEGER,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    library       TEXT    NOT NULL DEFAULT 'beginner-videos',
    status        TEXT    NOT NULL DEFAULT 'draft',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- CMS: PDFs / Notes
  CREATE TABLE IF NOT EXISTS pdfs_cms (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    description   TEXT,
    url           TEXT,
    category      TEXT,
    required_plan TEXT    NOT NULL DEFAULT 'Premium',
    release_month INTEGER,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    library       TEXT    NOT NULL DEFAULT 'beginner-notes',
    status        TEXT    NOT NULL DEFAULT 'draft',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- CMS: Announcements / Notifications
  CREATE TABLE IF NOT EXISTS announcements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    content     TEXT,
    type        TEXT    NOT NULL DEFAULT 'info',
    status      TEXT    NOT NULL DEFAULT 'draft',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );


  -- CMS: Research Hub (Free)
  CREATE TABLE IF NOT EXISTS chart_studies_cms (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    summary       TEXT,
    cover_image   TEXT,
    content_url   TEXT,
    publish_date  TEXT,
    status        TEXT    NOT NULL DEFAULT 'draft',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS research_reports_cms (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    company       TEXT,
    category      TEXT,
    cover_image   TEXT,
    read_url      TEXT,
    publish_date  TEXT,
    status        TEXT    NOT NULL DEFAULT 'draft',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ipo_research_cms (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ipo_name      TEXT    NOT NULL,
    industry      TEXT,
    issue_size    TEXT,
    open_date     TEXT,
    listing_date  TEXT,
    summary       TEXT,
    read_url      TEXT,
    publish_date  TEXT,
    status        TEXT    NOT NULL DEFAULT 'draft',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sector_research_cms (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_name   TEXT    NOT NULL,
    sector_image  TEXT,
    summary       TEXT,
    read_url      TEXT,
    publish_date  TEXT,
    status        TEXT    NOT NULL DEFAULT 'draft',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- CMS: Premium Research
  CREATE TABLE IF NOT EXISTS premium_research_cms (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               TEXT    NOT NULL,
    company             TEXT,
    summary             TEXT,
    preview_text        TEXT,
    estimated_read_time TEXT,
    cover_image         TEXT,
    pdf_url             TEXT,
    price               INTEGER NOT NULL DEFAULT 99,
    publish_date        TEXT,
    display_order       INTEGER NOT NULL DEFAULT 0,
    is_featured         INTEGER NOT NULL DEFAULT 0,
    status              TEXT    NOT NULL DEFAULT 'draft',
    created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Premium Report Purchases Ownership Table
  CREATE TABLE IF NOT EXISTS premium_purchases (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id           INTEGER NOT NULL REFERENCES premium_research_cms(id) ON DELETE CASCADE,
    razorpay_order_id   TEXT,
    purchased_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, report_id)
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_otps_identifier  ON otps(identifier);
  CREATE INDEX IF NOT EXISTS idx_sessions_user    ON user_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_payments_user    ON payments(user_id);
  CREATE INDEX IF NOT EXISTS idx_payments_status  ON payments(status);
  CREATE INDEX IF NOT EXISTS idx_trades_status    ON trades_cms(status);
  CREATE INDEX IF NOT EXISTS idx_videos_status    ON videos_cms(status);
  CREATE INDEX IF NOT EXISTS idx_pdfs_status      ON pdfs_cms(status);
`);

ensureColumn("videos_cms", "library", "library TEXT NOT NULL DEFAULT 'beginner-videos'");
ensureColumn("pdfs_cms", "library", "library TEXT NOT NULL DEFAULT 'beginner-notes'");

if (!db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_videos_library'").get()) {
  db.exec("CREATE INDEX idx_videos_library ON videos_cms(library)");
}
if (!db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_pdfs_library'").get()) {
  db.exec("CREATE INDEX idx_pdfs_library ON pdfs_cms(library)");
}

// ─── Additional indexes and setup ───────────────────────────────────────────

db.exec(`
`);

console.log(`[db] SQLite ready at ${DB_PATH}`);

module.exports = db;
