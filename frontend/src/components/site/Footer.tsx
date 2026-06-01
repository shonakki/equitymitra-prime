import { Youtube, Send, Instagram } from "lucide-react";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Learning", href: "#learn" },
  { label: "Pricing", href: "#pricing" },
  { label: "Telegram", href: "https://t.me/equitymitra" },
  { label: "YouTube", href: "#youtube" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-bold tracking-widest text-white">
          EQUITY<span className="gold-text">MITRA</span>
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/55">
          By Khichi Brothers
        </p>
        <p className="mt-3 text-xs text-white/55 italic">Trade With Logic, Not Emotion.</p>

        <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-[var(--gold)] transition">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="mt-5 flex items-center justify-center gap-3">
          <a
            href="https://youtube.com/@equitymitra"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="h-9 w-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition"
          >
            <Youtube className="h-4 w-4" />
          </a>
          <a
            href="https://t.me/equitymitra"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
            className="h-9 w-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition"
          >
            <Send className="h-4 w-4" />
          </a>
          <a
            href="https://instagram.com/equitymitra"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="h-9 w-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition"
          >
            <Instagram className="h-4 w-4" />
          </a>
        </div>

        <a
          href="mailto:support@equitymitra.com"
          className="mt-5 inline-block text-sm text-white/70 hover:text-[var(--gold)]"
        >
          support@equitymitra.com
        </a>

        <p className="mt-6 text-xs text-white/45 max-w-2xl mx-auto leading-relaxed">
          <span className="text-white/60 font-semibold">Disclaimer:</span> EquityMitra is an
          educational and research platform. We do not guarantee profits and do not provide
          buy/sell recommendations. All information is for educational purposes only.
        </p>
        <p className="mt-3 text-xs text-white/35">
          © {new Date().getFullYear()} EquityMitra by Khichi Brothers. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
