import { Send, ArrowRight, LineChart, CandlestickChart, GraduationCap, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: LineChart,
    title: "Research Based Trading",
    desc: "Every idea backed by structure, data and technical reasoning.",
  },
  {
    icon: CandlestickChart,
    title: "ATE Price & Volume Concept",
    desc: "Read price and volume behavior through ATE concepts and real market structure.",
  },
  {
    icon: GraduationCap,
    title: "Experience Based Learning",
    desc: "Lessons drawn from real screen time and market experience.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Management First",
    desc: "Protect capital first and focus on consistency.",
  },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(212,175,55,0.18), rgba(11,29,58,0.25), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-14 sm:pt-28 sm:pb-20 text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">
          Learn Trading Professionally
        </span>
        <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white">
          EQUITY<span className="gold-text">MITRA</span>
        </h1>
        <p className="mt-2 text-[13px] uppercase tracking-[0.35em] text-white/70">
          By Khichi Brothers
        </p>
        <p className="mt-6 text-lg sm:text-xl text-white/85 italic">
          Trade With Logic, Not Emotion.
        </p>
        <p className="mt-4 text-base font-medium text-white/80 max-w-2xl mx-auto leading-relaxed">
          Daily market analysis, learning videos and professional trading education.
        </p>

        <div className="mt-9 flex flex-wrap gap-3 justify-center">
          <a
            href="#analysis"
            className="inline-flex items-center gap-2 rounded-md gold-gradient px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90 transition"
          >
            Today's Analysis <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://t.me/equitymitra"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition"
          >
            <Send className="h-4 w-4" /> Join Telegram
          </a>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-card/50 p-5 hover:border-[var(--gold)]/30 transition"
            >
              <div
                className="h-10 w-10 rounded-md grid place-items-center border"
                style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(11,29,58,0.4))",
                  borderColor: "rgba(212,175,55,0.3)",
                  color: "var(--gold)",
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-xs text-white/55 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
