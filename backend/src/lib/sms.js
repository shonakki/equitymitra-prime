"use strict";

/**
 * SMS abstraction layer.
 *
 * Priority:
 *  1. MSG91 (if MSG91_API_KEY + MSG91_TEMPLATE_ID set)
 *  2. Console log fallback (safe for Railway dev logs — OTP visible in logs)
 *
 * To add Twilio / Fast2SMS: extend the providers below.
 */

const axios = require("axios");

async function sendSmsMsg91(phone, otp) {
  const apiKey     = process.env.MSG91_API_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId   = process.env.MSG91_SENDER_ID || "EQMTRA";

  const payload = {
    template_id: templateId,
    short_url:   "0",
    mobiles:     `91${phone}`,
    otp,
    sender:      senderId,
  };

  await axios.post("https://api.msg91.com/api/v5/otp", payload, {
    headers: { authkey: apiKey, "content-type": "application/json" },
    timeout: 10_000,
  });
}

/**
 * sendOtp(phone, otp)
 * Sends OTP via SMS. Falls back to console if no provider is configured.
 * Returns { ok: true } or throws.
 */
async function sendOtp(phone, otp) {
  if (process.env.MSG91_API_KEY && process.env.MSG91_TEMPLATE_ID) {
    await sendSmsMsg91(phone, otp);
    console.log(`[sms] OTP sent to ${phone}`);
  } else {
    // Fallback: log to Railway console — visible in Railway logs dashboard
    console.log(`[sms:dev] OTP for +91${phone} → ${otp}`);
  }
  return { ok: true };
}

/**
 * sendEmailOtp(email, otp)
 * Placeholder — extend with Nodemailer / SendGrid / Resend.
 */
async function sendEmailOtp(email, otp) {
  console.log(`[email:dev] OTP for ${email} → ${otp}`);
  return { ok: true };
}

module.exports = { sendOtp, sendEmailOtp };
