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
 * Sends a secure 6-digit OTP using Resend.
 */
async function sendEmailOtp(email, otp) {
  const apiKey    = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (apiKey) {
    try {
      await axios.post(
        "https://api.resend.com/emails",
        {
          from: `EquityMitra <${fromEmail}>`,
          to: email,
          subject: `${otp} is your EquityMitra OTP`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #edf2f7; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
              <h2 style="color: #4f46e5; margin-bottom: 20px; font-weight: 800; font-size: 22px;">EquityMitra Authentication</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #4a5568;">Use the following one-time password (OTP) to complete your login:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #1a202c; background-color: #f7fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0; border: 1px solid #edf2f7;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #718096; line-height: 1.5;">This OTP is secure and will expire in 5 minutes. If you did not request this, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;" />
              <p style="font-size: 12px; color: #a0aec0; text-align: center;">&copy; ${new Date().getFullYear()} EquityMitra. All rights reserved.</p>
            </div>
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10_000,
        }
      );
      console.log(`[email] OTP email sent successfully to ${email}`);
    } catch (err) {
      console.error("[email] Failed to send OTP via Resend:", err.response?.data || err.message);
      throw new Error("Failed to send email OTP. Please try again later.");
    }
  } else {
    // Fallback: log to console
    console.log(`[email:dev] OTP for ${email} → ${otp}`);
  }
  return { ok: true };
}

module.exports = { sendOtp, sendEmailOtp };
