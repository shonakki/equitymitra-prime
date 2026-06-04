/**
 * useTickChart — real-time WebSocket hook.
 *
 * Connects to the backend /ws endpoint (singleton across all hook instances).
 * On connect, the server sends a snapshot of all accumulated 1-min candles.
 * Subsequent "tick" messages carry the updated candle array for a symbol.
 *
 * When the WS is unavailable (market closed / backend unreachable) the hook
 * returns an empty array and `wsReady = false`; LiveCandleChart will fall
 * back to its mock renderer so the UI always looks good.
 */
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "./marketApi";

export interface OHLCCandle {
  time: number;   // epoch ms, floored to 1-min boundary
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Derive WS URL from the same base used by REST calls
const API_BASE = (
  (import.meta as any).env?.VITE_API_BASE ||
  "https://equitymitra-prime-production.up.railway.app"
).replace(/\/$/, "");

const WS_URL = API_BASE.replace(/^https/, "wss").replace(/^http/, "ws") + "/ws";

// ─── Singleton WS shared across all hook instances ──────────────────────────
type MsgHandler = (data: unknown) => void;

let sharedWs: WebSocket | null = null;
const listeners = new Set<MsgHandler>();
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wsConnecting = false;

function openSharedWS() {
  if (wsConnecting) return;
  if (sharedWs && (sharedWs.readyState === WebSocket.OPEN || sharedWs.readyState === WebSocket.CONNECTING)) return;
  wsConnecting = true;

  const ws = new WebSocket(WS_URL);
  sharedWs = ws;

  ws.onopen = () => { wsConnecting = false; };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data as string);
      for (const fn of listeners) { try { fn(data); } catch {} }
    } catch {}
  };

  ws.onerror = () => {};

  ws.onclose = () => {
    sharedWs = null;
    wsConnecting = false;
    if (!wsReconnectTimer) {
      wsReconnectTimer = setTimeout(() => {
        wsReconnectTimer = null;
        openSharedWS();
      }, 5_000);
    }
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTickChart(symbol: string) {
  const [candles, setCandles] = useState<OHLCCandle[]>([]);
  const [wsReady, setWsReady] = useState(false);
  const symbolRef = useRef(symbol);
  symbolRef.current = symbol;

  // On mount: fetch any candles already accumulated on the backend (REST)
  useEffect(() => {
    apiFetch<OHLCCandle[]>(`/api/candles/${symbol}`)
      .then((data) => { if (Array.isArray(data) && data.length) setCandles(data); })
      .catch(() => {}); // silently ignore — WS will fill in later
  }, [symbol]);

  // Connect WebSocket and handle messages
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard

    openSharedWS();

    const handler = (data: unknown) => {
      const msg = data as Record<string, unknown>;

      if (msg.type === "snapshot") {
        // { type:"snapshot", data:{ NIFTY:[...], BANKNIFTY:[...] } }
        const symData = (msg.data as Record<string, OHLCCandle[]>)?.[symbolRef.current];
        if (Array.isArray(symData) && symData.length) setCandles(symData);
        setWsReady(true);
        return;
      }

      if (msg.type === "tick" && msg.symbol === symbolRef.current) {
        // { type:"tick", symbol, ltp, candles:[...] }
        const c = msg.candles as OHLCCandle[];
        if (Array.isArray(c) && c.length) setCandles(c);
        setWsReady(true);
      }
    };

    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, [symbol]);

  return { candles, wsReady };
}
