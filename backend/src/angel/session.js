/**
 * Angel One SmartAPI session manager.
 * - Auto-generates TOTP from secret
 * - Logs in and caches JWT in memory
 * - Refreshes token on 401/expiry
 *
 * JWT is NEVER sent to the frontend — backend uses it server-side only.
 */
const axios = require("axios");
const { authenticator } = require("otplib");
const config = require("../config");

const BASE = "https://apiconnect.angelone.in";

let session = {
  jwt: null,
  refreshToken: null,
  feedToken: null,
  expiresAt: 0, // epoch ms
};

let inflightLogin = null;

function baseHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": "127.0.0.1",
    "X-ClientPublicIP": "127.0.0.1",
    "X-MACAddress": "00:00:00:00:00:00",
    "X-PrivateKey": config.angel.apiKey,
  };
}

async function loginInternal() {
  const totp = authenticator.generate(config.angel.totpSecret);
  const body = {
    clientcode: config.angel.clientCode,
    password: config.angel.password,
    totp,
  };
  const { data } = await axios.post(
    `${BASE}/rest/auth/angelbroking/user/v1/loginByPassword`,
    body,
    { headers: baseHeaders(), timeout: 15000 }
  );
  if (!data || data.status !== true || !data.data) {
    throw new Error(`Angel login failed: ${data?.message || "unknown"}`);
  }
  session = {
    jwt: data.data.jwtToken,
    refreshToken: data.data.refreshToken,
    feedToken: data.data.feedToken,
    // Angel JWTs are ~8h. Refresh proactively after 6h.
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
  };
  console.log("[angel] login ok");
  return session;
}

async function ensureSession() {
  if (session.jwt && Date.now() < session.expiresAt) return session;
  if (!inflightLogin) {
    inflightLogin = loginInternal().finally(() => {
      inflightLogin = null;
    });
  }
  return inflightLogin;
}

function authHeaders(s) {
  return { ...baseHeaders(), Authorization: `Bearer ${s.jwt}` };
}

/**
 * Authenticated POST. Retries once on 401 by re-logging in.
 */
async function angelPost(path, body) {
  const s = await ensureSession();
  try {
    const { data } = await axios.post(`${BASE}${path}`, body, {
      headers: authHeaders(s),
      timeout: 15000,
    });
    return data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      session.jwt = null;
      const fresh = await ensureSession();
      const { data } = await axios.post(`${BASE}${path}`, body, {
        headers: authHeaders(fresh),
        timeout: 15000,
      });
      return data;
    }
    throw err;
  }
}

function getFeedToken() {
  return session.feedToken;
}

module.exports = { ensureSession, angelPost, getFeedToken };
