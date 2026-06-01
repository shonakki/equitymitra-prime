import { useRef, useState } from "react";
import { MiniChart } from "./MiniChart";
import { SectionHeader } from "./SectionHeader";
import { Upload, ImageIcon } from "lucide-react";

type Stock = {
  s: string;
  t: string;
  side: "LONG" | "SHORT";
  entry: string;
  t1: string;
  t2: string;
  sl: string;
  risk: "Low" | "Medium" | "High";
  notes: string;
};

const STOCKS: Stock[] = [
  {
    s: "RELIANCE", t: "NSE • 15m", side: "LONG",
    entry: "2,945", t1: "2,985", t2: "3,030", sl: "2,922", risk: "Low",
    notes: "Breakout above prior swing high with rising volume. Volume confirming the breakout.",
  },
  {
    s: "TATAMOTORS", t: "NSE • Daily", side: "LONG",
    entry: "968", t1: "995", t2: "1,030", sl: "948", risk: "Medium",
    notes: "Inside-bar breakout on daily with strong follow-through volume.",
  },
];

const RISK_STYLE = {
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  High: "bg-red-500/15 text-red-400 border-red-500/30",
} as const;

function ChartUpload({ trend, seed }: { trend: "up" | "down"; seed: number }) {
  const [img, setImg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onFile = (f?: File) => { if (f) setImg(URL.createObjectURL(f)); };
  return (
    <div
      className="relative rounded-lg bg-black/40 p-2 group border border-white/5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
    >
      {img ? (
        <img src={img} alt="Chart" className="w-full h-44 object-cover rounded" />
      ) : (
        <div className="h-44 flex items-center justify-center">
          <MiniChart trend={trend} seed={seed} />
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-2 rounded opacity-0 group-hover:opacity-100 bg-black/65 transition flex items-center justify-center gap-2 text-xs font-semibold text-[var(--gold)] border border-dashed border-[var(--gold)]/50"
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
  );
}

export function DailyAnalysis() {
  return (
    <section id="analysis" className="relative py-16 sm:py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Daily Picks" title="Today's trade ideas" />
        <div className="grid md:grid-cols-2 gap-5">
          {STOCKS.map((s, i) => (
            <article key={s.s} className="rounded-xl border border-white/10 bg-card/60 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{s.s}</h3>
                  <p className="text-xs text-white/50 mt-0.5">{s.t}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      s.side === "LONG"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {s.side}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RISK_STYLE[s.risk]}`}
                  >
                    {s.risk} risk
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <ChartUpload trend={s.side === "LONG" ? "up" : "down"} seed={i + 5} />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[11px]">
                <div className="rounded-md bg-white/5 py-2">
                  <p className="text-white/45 text-[9px] uppercase">Entry</p>
                  <p className="mt-0.5 font-semibold text-white">₹{s.entry}</p>
                </div>
                <div className="rounded-md bg-emerald-500/10 py-2">
                  <p className="text-white/45 text-[9px] uppercase">T1</p>
                  <p className="mt-0.5 font-semibold text-emerald-400">₹{s.t1}</p>
                </div>
                <div className="rounded-md bg-emerald-500/10 py-2">
                  <p className="text-white/45 text-[9px] uppercase">T2</p>
                  <p className="mt-0.5 font-semibold text-emerald-400">₹{s.t2}</p>
                </div>
                <div className="rounded-md bg-red-500/10 py-2">
                  <p className="text-white/45 text-[9px] uppercase">SL</p>
                  <p className="mt-0.5 font-semibold text-red-400">₹{s.sl}</p>
                </div>
              </div>

              <div className="mt-3 rounded-md border border-white/5 bg-black/20 p-3">
                <p className="text-[9px] uppercase tracking-wider text-[var(--gold)] font-semibold mb-1">
                  Trade notes
                </p>
                <p className="text-xs text-white/65 leading-relaxed">{s.notes}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
