type Props = {
  trend?: "up" | "down";
  seed?: number;
  height?: number;
  candleCount?: number;
};

/**
 * TradingView-style candlestick chart with:
 *  - Wider, well-spaced candles (~8-10px bodies)
 *  - Real OHLC wicks
 *  - Right-side price scale
 *  - Bottom time scale
 *  - Volume panel below price
 *  - EMA(9) and EMA(21) overlays
 *  - Subtle grid + crosshair-style last price line
 */
export function MiniChart({
  trend = "up",
  seed = 1,
  height = 240,
  candleCount = 28,
}: Props) {
  const rng = (i: number) => {
    const x = Math.sin((seed + 1) * (i + 1.91)) * 10000;
    return x - Math.floor(x);
  };

  // OHLC + volume synthesis
  let price = 100;
  const data = Array.from({ length: candleCount }, (_, i) => {
    const dir = trend === "up" ? 1 : -1;
    const drift = dir * (0.45 + rng(i) * 0.55);
    const range = 1.3 + rng(i + 9) * 2.6;
    const o = price;
    const c = o + drift + (rng(i + 17) - 0.5) * range;
    const h = Math.max(o, c) + rng(i + 31) * range * 0.85;
    const l = Math.min(o, c) - rng(i + 47) * range * 0.85;
    const v = 30 + rng(i + 61) * 70 + Math.abs(c - o) * 9;
    price = c;
    return { o, c, h, l, v };
  });

  // EMA helper
  const ema = (period: number) => {
    const k = 2 / (period + 1);
    let prev = data[0].c;
    return data.map((d, i) => (i === 0 ? (prev = d.c) : (prev = d.c * k + prev * (1 - k))));
  };
  const ema9 = ema(9);
  const ema21 = ema(21);

  // Layout
  const w = 560;
  const h = height;
  const padL = 8;
  const padR = 46; // price scale
  const padT = 10;
  const padB = 22; // time scale

  const priceAreaH = (h - padT - padB) * 0.72;
  const volAreaH = (h - padT - padB) * 0.22;
  const volTop = padT + priceAreaH + 8;

  const all = data.flatMap((d) => [d.h, d.l]);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const maxVol = Math.max(...data.map((d) => d.v));

  const innerW = w - padL - padR;
  const cw = innerW / candleCount;
  const bodyW = Math.max(6, Math.min(10, cw * 0.7));
  const y = (v: number) => padT + ((max - v) / range) * priceAreaH;
  const vy = (v: number) => volTop + (1 - v / maxVol) * volAreaH;

  // Price ticks (right side)
  const ticks = 5;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => max - (range * i) / ticks);

  // Time labels
  const labels = ["09:15", "10:30", "11:45", "13:15", "14:30", "15:30"];

  const lineFor = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = padL + i * cw + cw / 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y(v).toFixed(1)}`;
      })
      .join(" ");

  const lastClose = data[data.length - 1].c;
  const lastUp = data[data.length - 1].c >= data[data.length - 1].o;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full block"
      style={{ height }}
    >
      <defs>
        <linearGradient id={`tvbg-${seed}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0a1224" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#05080f" stopOpacity="1" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={w} height={h} fill={`url(#tvbg-${seed})`} rx="6" />

      {/* Horizontal grid */}
      {tickVals.map((tv, i) => {
        const ty = padT + (priceAreaH * i) / ticks;
        return (
          <g key={`g-${i}`}>
            <line
              x1={padL}
              x2={w - padR}
              y1={ty}
              y2={ty}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2 4"
            />
            <text
              x={w - padR + 4}
              y={ty + 3}
              fontSize="9"
              fill="rgba(255,255,255,0.45)"
              fontFamily="ui-monospace, monospace"
            >
              {tv.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Time axis labels */}
      {labels.map((lab, i) => {
        const p = i / (labels.length - 1);
        const tx = padL + innerW * p;
        return (
          <g key={`t-${i}`}>
            <line
              x1={tx}
              x2={tx}
              y1={padT}
              y2={h - padB}
              stroke="rgba(255,255,255,0.035)"
            />
            <text
              x={tx}
              y={h - 6}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(255,255,255,0.45)"
              fontFamily="ui-monospace, monospace"
            >
              {lab}
            </text>
          </g>
        );
      })}

      {/* Volume bars */}
      {data.map((d, i) => {
        const x = padL + i * cw + (cw - bodyW) / 2;
        const top = vy(d.v);
        const up = d.c >= d.o;
        return (
          <rect
            key={`v-${i}`}
            x={x}
            y={top}
            width={bodyW}
            height={Math.max(1, volTop + volAreaH - top)}
            fill={up ? "#16a34a" : "#dc2626"}
            opacity="0.55"
          />
        );
      })}

      {/* EMA 21 */}
      <path d={lineFor(ema21)} fill="none" stroke="#d4af37" strokeWidth="1.4" opacity="0.9" />
      {/* EMA 9 */}
      <path d={lineFor(ema9)} fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.85" />

      {/* Candles */}
      {data.map((d, i) => {
        const x = padL + i * cw + cw / 2;
        const up = d.c >= d.o;
        const color = up ? "#22c55e" : "#ef4444";
        const bodyTop = y(Math.max(d.o, d.c));
        const bodyH = Math.max(1.5, Math.abs(y(d.o) - y(d.c)));
        return (
          <g key={`c-${i}`}>
            <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={color} strokeWidth="1" />
            <rect
              x={x - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={color}
              stroke={color}
              strokeWidth="0.5"
              rx="0.5"
            />
          </g>
        );
      })}

      {/* Last price tag */}
      <g>
        <line
          x1={padL}
          x2={w - padR}
          y1={y(lastClose)}
          y2={y(lastClose)}
          stroke={lastUp ? "#22c55e" : "#ef4444"}
          strokeWidth="0.6"
          strokeDasharray="3 3"
          opacity="0.7"
        />
        <rect
          x={w - padR + 1}
          y={y(lastClose) - 7}
          width={42}
          height={14}
          rx="2"
          fill={lastUp ? "#16a34a" : "#dc2626"}
        />
        <text
          x={w - padR + 5}
          y={y(lastClose) + 3}
          fontSize="9"
          fontWeight="700"
          fill="#fff"
          fontFamily="ui-monospace, monospace"
        >
          {lastClose.toFixed(2)}
        </text>
      </g>

      {/* Separator price/volume */}
      <line
        x1={padL}
        x2={w - padR}
        y1={volTop - 4}
        y2={volTop - 4}
        stroke="rgba(255,255,255,0.08)"
      />

      {/* Legend */}
      <g fontFamily="ui-monospace, monospace" fontSize="9">
        <text x={padL + 4} y={padT + 10} fill="#60a5fa">EMA 9</text>
        <text x={padL + 44} y={padT + 10} fill="#d4af37">EMA 21</text>
        <text x={padL + 4} y={volTop + 10} fill="rgba(255,255,255,0.5)">Vol</text>
      </g>
    </svg>
  );
}
