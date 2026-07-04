"use strict";

const express = require("express");
const db = require("../db");
const requireAuthOptional = require("../middleware/requireAuthOptional");
const requireAuth = require("../middleware/requireAuth");
const { PDFDocument, rgb, degrees } = require("pdf-lib");
const axios = require("axios");

const router = express.Router();

// Helper to fetch published items
function getPublished(table) {
  return db.prepare(`SELECT * FROM ${table} WHERE status = 'published' ORDER BY publish_date DESC, id DESC`).all();
}

// ─── Free Tabs ───────────────────────────────────────────────────────────────

router.get("/chart-studies", (req, res) => {
  try {
    const data = getPublished("chart_studies_cms");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("[research/chart-studies]", err);
    res.status(500).json({ ok: false, error: "Failed to fetch chart studies" });
  }
});

router.get("/reports", (req, res) => {
  try {
    const data = getPublished("research_reports_cms");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("[research/reports]", err);
    res.status(500).json({ ok: false, error: "Failed to fetch research reports" });
  }
});

router.get("/ipos", (req, res) => {
  try {
    const data = getPublished("ipo_research_cms");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("[research/ipos]", err);
    res.status(500).json({ ok: false, error: "Failed to fetch IPO research" });
  }
});

router.get("/sectors", (req, res) => {
  try {
    const data = getPublished("sector_research_cms");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("[research/sectors]", err);
    res.status(500).json({ ok: false, error: "Failed to fetch sector research" });
  }
});

// ─── Premium Tab ─────────────────────────────────────────────────────────────

router.get("/premium", requireAuthOptional, (req, res) => {
  try {
    const userId = req.user ? req.user.sub : null;
    let purchases = new Set();

    if (userId) {
      const rows = db.prepare(`SELECT report_id FROM premium_purchases WHERE user_id = ?`).all(userId);
      rows.forEach(r => purchases.add(r.report_id));
    }

    const reports = db.prepare(`
      SELECT id, title, company, summary, preview_text, estimated_read_time, cover_image, price, publish_date, display_order, is_featured 
      FROM premium_research_cms 
      WHERE status = 'published' 
      ORDER BY display_order ASC, publish_date DESC
    `).all();

    const data = reports.map(r => ({
      ...r,
      isUnlocked: purchases.has(r.id)
    }));

    res.json({ ok: true, data });
  } catch (err) {
    console.error("[research/premium]", err);
    res.status(500).json({ ok: false, error: "Failed to fetch premium research" });
  }
});

// ─── Purchased Reports (User Profile) ────────────────────────────────────────

router.get("/purchased", requireAuth, (req, res) => {
  try {
    const data = db.prepare(`
      SELECT p.purchased_at, r.id, r.title, r.company, r.cover_image, r.publish_date, r.pdf_url
      FROM premium_purchases p
      JOIN premium_research_cms r ON p.report_id = r.id
      WHERE p.user_id = ?
      ORDER BY p.purchased_at DESC
    `).all(req.user.sub);

    res.json({ ok: true, data });
  } catch (err) {
    console.error("[research/purchased]", err);
    res.status(500).json({ ok: false, error: "Failed to fetch purchased research" });
  }
});

// ─── Premium PDF Watermarking & Download ─────────────────────────────────────

router.get("/premium/:id/download", requireAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.sub;

    // Verify ownership
    const purchase = db.prepare(`SELECT * FROM premium_purchases WHERE user_id = ? AND report_id = ?`).get(userId, reportId);
    if (!purchase) {
      return res.status(403).json({ ok: false, error: "You do not own this report" });
    }

    // Get PDF URL
    const report = db.prepare(`SELECT pdf_url, title FROM premium_research_cms WHERE id = ?`).get(reportId);
    if (!report || !report.pdf_url) {
      return res.status(404).json({ ok: false, error: "PDF not found" });
    }

    // Get user details for watermark
    const user = db.prepare(`SELECT email, phone FROM users WHERE id = ?`).get(userId);
    const identifier = user.email || user.phone || `ID: ${userId}`;
    const watermarkText = `EquityMitra - ${identifier}`;

    // Fetch the original PDF
    let pdfBuffer;
    try {
      // In a real prod environment with signed URLs this might need headers
      const response = await axios.get(report.pdf_url, { responseType: "arraybuffer" });
      pdfBuffer = response.data;
    } catch (e) {
      console.error("Failed to fetch original PDF from URL:", report.pdf_url, e.message);
      return res.status(502).json({ ok: false, error: "Failed to retrieve source document" });
    }

    // Apply Watermark
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 150,
        y: height / 2,
        size: 24,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.3,
        rotate: degrees(45)
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="EquityMitra_${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    res.send(Buffer.from(modifiedPdfBytes));

  } catch (err) {
    console.error("[research/premium/download]", err);
    res.status(500).json({ ok: false, error: "Failed to generate protected PDF" });
  }
});

module.exports = router;
