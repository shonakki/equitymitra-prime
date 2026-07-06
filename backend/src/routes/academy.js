"use strict";

const router = require("express").Router();
const db = require("../db");

function respondLibrary(req, res, table, library) {
  try {
    const rows = db.prepare(
      `SELECT * FROM ${table} WHERE status = 'published' AND library = ? ORDER BY sort_order ASC, created_at DESC`
    ).all(library);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(`[academy/${table}]`, err);
    res.status(500).json({ ok: false, error: "Failed" });
  }
}

router.get("/beginner/videos", (req, res) => respondLibrary(req, res, "videos_cms", "beginner-videos"));
router.get("/beginner/notes", (req, res) => respondLibrary(req, res, "pdfs_cms", "beginner-notes"));
router.get("/founder/videos", (req, res) => respondLibrary(req, res, "videos_cms", "founder-videos"));
router.get("/founder/notes", (req, res) => respondLibrary(req, res, "pdfs_cms", "founder-notes"));

module.exports = router;
