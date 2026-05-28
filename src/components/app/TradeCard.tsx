import { useRef, useState } from "react";
import { TrendingUp, TrendingDown, Upload, ImageIcon, Crown, Target } from "lucide-react";
import { MiniChart } from "@/components/site/MiniChart";

export type Trade = {
  s: string;
  exch: string;
  category: string;
  side: "Bullish" | "Bearish";
  setup: "ATE" | "Breakout" | "Pullback" | "Reversal" | "Trend Continuation";
  entry: string;
  t1: string;
  t2: string;
  sl: string;
  risk: "Low" | "Medium" | "High";
  potential: string;
  notes: string;
  premium?: boolean;
};

function RiskPill({ level }: { level: Trade["risk"] }) {
  const map = {
    Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    High: "bg-red-500/15 text-red-400 border-red-500/30",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${map[level]}`}>
      {level} risk
    </span>
  );
}

export function TradeCard({ t, index }: { t: Trade; index: number }) {
  const [img, setImg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onFile = (f?: File) => { if (f) setImg(URL.createObjectURL(f)); };
  const bull = t.side === "Bullish";

  return (
    <article className="relative rounded-2xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/30 transition">
      {t.premium && (
        <span className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full gold-gradient text-black text-[10px] font-bold px-2 py-0.5">
          <Crown className="h-3 w-3" /> Prime
        </span>
      )}

      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">{t.s}</h3>
          <p className="text-[11px] text-white/45 mt-0.5">{t.exch}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            bull ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          }`}>
            {bull ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {t.side}
          </span>
          <RiskPill level={t.risk} />
        </div>
      </header>

      <div className="mt-3 flex items-center gap-2 text-[11px]">
        <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-white/70">{t.setup}</span>
        <span className="text-emerald-400 inline-flex items-center gap-1">
          <Target className="h-3 w-3" /> {t.potential} potential
        </span>
      </div>

      <div
        className="relative mt-4 rounded-lg bg-black/40 p-1.5 group border border-white/5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
      >
        {img ? (
          <img src={img} alt="Chart" className="w-full h-36 object-cover rounded" />
        ) : (
          <div className="h-36 flex items-center justify-center">
            <MiniChart trend={bull ? "up" : "down"} seed={index + 11} />
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-1.5 rounded opacity-0 group-hover:opacity-100 bg-black/65 transition flex items-center justify-center gap-2 text-xs font-semibold text-[var(--gold)] border border-dashed border-[var(--gold)]/50"
        >
          {img ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {img ? "Replace chart" : "Upload chart image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[11px]">
        <div className="rounded-md bg-white/5 py-1.5">
          <p className="text-white/45 text-[9px] uppercase">Entry</p>
          <p className="mt-0.5 font-semibold text-white">₹{t.entry}</p>
        </div>
        <div className="rounded-md bg-emerald-500/10 py-1.5">
          <p className="text-white/45 text-[9px] uppercase">T1</p>
          <p className="mt-0.5 font-semibold text-emerald-400">₹{t.t1}</p>
        </div>
        <div className="rounded-md bg-emerald-500/10 py-1.5">
          <p className="text-white/45 text-[9px] uppercase">T2</p>
          <p className="mt-0.5 font-semibold text-emerald-400">₹{t.t2}</p>
        </div>
        <div className="rounded-md bg-red-500/10 py-1.5">
          <p className="text-white/45 text-[9px] uppercase">SL</p>
          <p className="mt-0.5 font-semibold text-red-400">₹{t.sl}</p>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-white/5 bg-black/20 p-3">
        <p className="text-[9px] uppercase tracking-wider text-[var(--gold)] font-semibold mb-1">Trade notes</p>
        <p className="text-xs text-white/65 leading-relaxed">{t.notes}</p>
      </div>
    </article>
  );
}
