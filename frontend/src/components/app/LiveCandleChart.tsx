/**
 * LiveCandleChart
 *
 * Renders a TradingView-style candlestick chart from real OHLCCandle data.
 * When fewer than 3 real candles exist (market closed / pre-open) it falls
 * back to the seeded mock generator so the card always looks great.
 *
 * Features: candles + wicks, EMA9 (blue), EMA21 (gold),
 * volume panel, right price scale, bottom time scale,
 * last-price dashed line + coloured tag.
 */
import type { OHLCCandle } from "@/lib/useTickChart";

interface Props {
  candles: OHLCCandle[];
  trend?: "up" | "down";
  seed?: number;
  height?: number;
}

// ─── Seeded mock fallback (identical algo to the old MiniChart) ───────────────
function mockCandles(trend: "up" | "down", seed: number, count: number): OHLCCandle[] {
  const rng = (i: number) => {
    const x = Math.sin((seed + 1) * (i + 1.91)) * 10000;
    return x - Math.floor(x);
  };
  let price = 100;
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const dir = trend === "up" ? 1 : -1;
    const drift = dir * (0.45 + rng(i) * 0.55);
    const rng2 = 1.3 + rng(i + 9) * 2.6;
    const o = price;
    const c = o + drift + (rng(i + 17) - 0.5) * rng2;
    const h = Math.max(o, c) + rng(i + 31) * rng2 * 0.85;
    const l = Math.min(o, c) - rng(i + 47) * rng2 * 0.85;
    const v = 30 + rng(i + 61) * 70 + Math.abs(c - o) * 9;
    price = c;
    return { time: now - (count - i) * 60_000, open: o, high: h, low: l, close: c, volume: v };
  });
}

export function LiveCandleChart({
  candles: rawCandles,
  trend = "up",
  seed = 1,
  height = 240,
}: Props) {
  const DISPLAY = 28;

  // Use real data if ≥ 3 candles, otherwise fall back to mock
  const data =
    rawCandles.length >= 3
      ? rawCandles.slice(-DISPLAY)
      : mockCandles(trend, seed, DISPLAY);

  // ── EMAs ──────────────────────────────────────────────────────────────────
  const closes = data.map((d) => d.close);
  const ema = (period: number) => {
    const k = 2 / (period + 1);
    let prev = closes[0];
    return closes.map((c, i) =>
      i === 0 ? (prev = c) : (prev = c * k + prev * (1 - k))
    );
  };
  const ema9 = ema(9);
  const ema21 = ema(21);

  // ── Layout constants ──────────────────────────────────────────────────────
  const W = 560;
  const H = height;
  const padL = 8, padR = 46, padT = 10, padB = 22;
  const priceH = (H - padT - padB) * 0.72;
  const volH   = (H - padT - padB) * 0.22;
  const volTop = padT + priceH + 8;

  // Price scale
  const allPx = data.flatMap((d) => [d.high, d.low]).filter(Number.isFinite);
  const pmin = Math.min(...allPx);
  const pmax = Math.max(...allPx);
  const prange = pmax - pmin || 1;

  // Volume scale
  const maxVol = Math.max(...data.map((d) => d.volume ?? 0), 1);

  const innerW = W - padL - padR;
  const cw     = innerW / data.length;
  const bodyW  = Math.max(5, Math.min(10, cw * 0.68));

  const yP = (v: number) => padT + ((pmax - v) / prange) * priceH;
  const yV = (v: number) => volTop + (1 - (v ?? 0) / maxVol) * volH;

  // Price tick labels
  const TICKS = 5;
  const tickVals = Array.from(
    { length: TICKS + 1 },
    (_, i) => pmax - (prange * i) / TICKS
  );

  // Time labels from real candle timestamps
  const LABELS = 6;
  const labelIdxs = Array.from({ length: LABELS }, (_, i) =>
    Math.round((i / (LABELS - 1)) * (data.length - 1))
  );
  const timeLabels = labelIdxs.map((idx) => {
    const ts = data[idx]?.time;
    if (!ts) return "";
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  // EMA path helper
  const linePath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = padL + i * cw + cw / 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${yP(v).toFixed(1)}`;
      })
      .join(" ");

  const last    = data[data.length - 1];
  const lastUp  = (last?.close ?? 0) >= (last?.open ?? 0);
  const lastClose = last?.close ?? 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full block"
      style={{ height }}
    >
      <defs>
        <linearGradient id={`lcbg-${seed}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#0a1224" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#05080f" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={W} height={H} fill={`url(#lcbg-${seed})`} rx="6" />

      {/* Horizontal grid + right price scale */}
      {tickVals.map((tv, i) => {
        const ty = padT + (priceH * i) / TICKS;
        // Show integer prices for real data, 2dp for mock (values ~100)
        const label = rawCandles.length >= 3 ? tv.toFixed(0) : tv.toFixed(2);
        return (
          <g key={`hg-${i}`}>
            <line
              x1={padL} x2={W - padR} y1={ty} y2={ty}
              stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"
            />
            <text
              x={W - padR + 4} y={ty + 3}
              fontSize="9" fill="rgba(255,255,255,0.45)"
              fontFamily="ui-monospace,monospace"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Vertical grid + bottom time scale */}
      {labelIdxs.map((idx, i) => {
        const frac = i / (LABELS - 1);
        const tx = padL + innerW * frac;
        return (
          <g key={`vg-${i}`}>
            <line
              x1={tx} x2={tx} y1={padT} y2={H - padB}
              stroke="rgba(255,255,255,0.035)"
            />
            <text
              x={tx} y={H - 6}
              textAnchor="middle" fontSize="9"
              fill="rgba(255,255,255,0.45)"
              fontFamily="ui-monospace,monospace"
            >
              {timeLabels[i]}
            </text>
          </g>
        );
      })}

      {/* Volume bars */}
      {data.map((d, i) => {
        const bx  = padL + i * cw + (cw - bodyW) / 2;
        const top = yV(d.volume ?? 0);
        const up  = d.close >= d.open;
        return (
          <rect
            key={`vb-${i}`}
            x={bx} y={top} width={bodyW}
            height={Math.max(1, volTop + volH - top)}
            fill={up ? "#16a34a" : "#dc2626"}
            opacity="0.55"
          />
        );
      })}

      {/* EMA 21 (gold) */}
      <path d={linePath(ema21)} fill="none" stroke="#d4af37" strokeWidth="1.4" opacity="0.9" />
      {/* EMA 9 (blue) */}
      <path d={linePath(ema9)}  fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.85" />

      {/* Candlesticks */}
      {data.map((d, i) => {
        const cx    = padL + i * cw + cw / 2;
        const up    = d.close >= d.open;
        const color = up ? "#22c55e" : "#ef4444";
        const top   = yP(Math.max(d.open, d.close));
        const bh    = Math.max(1.5, Math.abs(yP(d.open) - yP(d.close)));
        return (
          <g key={`cd-${i}`}>
            {/* Wick */}
            <line
              x1={cx} x2={cx}
              y1={yP(d.high)} y2={yP(d.low)}
              stroke={color} strokeWidth="1"
            />
            {/* Body */}
            <rect
              x={cx - bodyW / 2} y={top}
              width={bodyW} height={bh}
              fill={color} stroke={color}
              strokeWidth="0.5" rx="0.5"
            />
          </g>
        );
      })}

      {/* Last-price dashed line + label tag */}
      <g>
        <line
          x1={padL} x2={W - padR}
          y1={yP(lastClose)} y2={yP(lastClose)}
          stroke={lastUp ? "#22c55e" : "#ef4444"}
          strokeWidth="0.6" strokeDasharray="3 3" opacity="0.75"
        />
        <rect
          x={W - padR + 1} y={yP(lastClose) - 7}
          width={43} height={14} rx="2"
          fill={lastUp ? "#16a34a" : "#dc2626"}
        />
        <text
          x={W - padR + 5} y={yP(lastClose) + 3}
          fontSize="9" fontWeight="700" fill="#fff"
          fontFamily="ui-monospace,monospace"
        >
          {rawCandles.length >= 3 ? lastClose.toFixed(0) : lastClose.toFixed(2)}
        </text>
      </g>

      {/* Price / volume separator */}
      <line
        x1={padL} x2={W - padR}
        y1={volTop - 4} y2={volTop - 4}
        stroke="rgba(255,255,255,0.08)"
      />

      {/* Legend */}
      <g fontFamily="ui-monospace,monospace" fontSize="9">
        <text x={padL + 4}  y={padT + 10} fill="#60a5fa">EMA 9</text>
        <text x={padL + 44} y={padT + 10} fill="#d4af37">EMA 21</text>
        {rawCandles.length >= 3 && (
          <text x={padL + 90} y={padT + 10} fill="rgba(52,211,153,0.7)">LIVE</text>
        )}
        <text x={padL + 4}  y={volTop + 10} fill="rgba(255,255,255,0.5)">Vol</text>
      </g>
    </svg>
  );
}
