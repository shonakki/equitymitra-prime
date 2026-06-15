# EquityMitra Backend (Angel One SmartAPI proxy)

Standalone Node.js + Express service. Deploys to **Railway**.
Frontend (TanStack Start on Cloudflare) calls only this backend — Angel
credentials and JWT never leave the server.

## Endpoints

- `GET /health`
- `GET /api/nifty`
- `GET /api/banknifty`
- `GET /api/finnifty`
- `GET /api/sensex`
- `GET /api/stock/:symbol` (e.g. `/api/stock/RELIANCE`)
- `GET /api/symbols` (list of supported tickers)

All `/api/*` responses: `{ ok: true, data: ... }` or `{ ok: false, error }`.

## Local dev

```bash
cd backend
cp .env.example .env   # fill in Angel creds
npm install
npm run dev            # http://localhost:8080/health
```

## Environment variables

| Key | Required | Notes |
|---|---|---|
| `ANGEL_API_KEY` | yes | SmartAPI key |
| `ANGEL_CLIENT_CODE` | yes | Angel client code (e.g. A1234567) |
| `ANGEL_PASSWORD` | yes | MPIN / password |
| `ANGEL_TOTP_SECRET` | yes | Base32 secret from the 2FA QR (NOT the 6-digit code) |
| `ALLOWED_ORIGINS` | yes | Comma-separated frontend origins |
| `FRONTEND_SHARED_SECRET` | recommended | If set, frontend must send `x-em-key` header |
| `PORT` | no | Railway sets this automatically |

## Deploy to Railway

1. Push repo to GitHub (or use Railway CLI).
2. railway.com → **New Project → Deploy from GitHub repo** → pick this repo.
3. **Settings → Root Directory**: `backend`
4. **Variables**: paste every key from `.env.example`.
5. **Networking → Generate Domain**. You'll get e.g. `equitymitra-api.up.railway.app`.
6. Healthcheck `/health` is already wired in `railway.json`.

## Frontend wiring (Cloudflare / TanStack Start)

Add to your frontend env (Cloudflare Pages/Workers vars):

```
VITE_API_BASE=https://equitymitra-api.up.railway.app
VITE_API_KEY=<same value as FRONTEND_SHARED_SECRET>
```

Then call:

```ts
const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/nifty`, {
  headers: { "x-em-key": import.meta.env.VITE_API_KEY },
});
const { data } = await res.json();
```

No changes to TanStack routing are required.

## WebSocket (future)

`src/server.js` already creates an `http.Server` wrapping Express. Uncomment
the `ws` block and connect to Angel's SmartStream using `getFeedToken()` from
`src/angel/session.js`. Path: `wss://<railway-domain>/ws`.

## Security notes

- JWT + refresh token live only in backend memory; never returned to client.
- TOTP generated per-login via `otplib` from the base32 secret.
- `helmet`, CORS allow-list, rate limiting (120 req/min/IP) enabled.
- Optional `x-em-key` shared secret blocks unknown callers.
- Add Redis later if you scale beyond 1 Railway instance (so JWT cache is shared).
