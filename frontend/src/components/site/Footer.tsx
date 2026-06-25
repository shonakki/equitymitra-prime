import { Youtube, Send, Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";

const SITE_LINKS = [
  { label: "About",    href: "#about" },
  { label: "Learning", href: "#learn" },
  { label: "Pricing",  href: "#pricing" },
  { label: "Telegram", href: "https://t.me/equitymitra", external: true },
  { label: "YouTube",  href: "#youtube" },
  { label: "Contact",  href: "#contact" },
];

const LEGAL_LINKS = [
  { label: "Disclaimer",    to: "/legal/disclaimer" },
  { label: "Terms",         to: "/legal/terms" },
  { label: "Privacy",       to: "/legal/privacy" },
  { label: "Refund Policy", to: "/legal/refund" },
  { label: "Risk Disclosure", to: "/legal/risk" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 pt-12 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-bold tracking-widest text-white">
          EQUITY<span className="gold-text">MITRA</span>
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/55">By Khichi Brothers</p>
        <p className="mt-3 text-xs text-white/55 italic">Trade With Logic, Not Emotion.</p>

        {/* Site nav */}
        <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
          {SITE_LINKS.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition">{l.label}</a>
            ) : (
              <a key={l.label} href={l.href} className="hover:text-[var(--gold)] transition">{l.label}</a>
            )
          )}
        </nav>

        {/* Legal links */}
        <nav className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[11px] text-white/40">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-[var(--gold)] transition">{l.label}</Link>
          ))}
        </nav>

        {/* Social icons */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {[
            { href: "https://youtube.com/@equitymitra", icon: Youtube, label: "YouTube" },
            { href: "https://t.me/equitymitra",         icon: Send,    label: "Telegram" },
            { href: "https://instagram.com/equitymitra",icon: Instagram,label: "Instagram" },
          ].map(({ href, icon: Icon, label }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
              className="h-9 w-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <a href="mailto:support@equitymitra.com" className="mt-5 inline-block text-sm text-white/70 hover:text-[var(--gold)]">
          support@equitymitra.com
        </a>

        {/* SEBI Disclaimer block */}
        <div className="mt-8 rounded-xl border border-white/10 bg-card/60 p-5 max-w-3xl mx-auto text-left space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-[var(--gold)] font-bold mb-2">Legal Disclaimer</p>
          <p className="text-[11px] text-white/45 leading-relaxed">
            <strong className="text-white/60">EquityMitra</strong> is an investor education and awareness initiative. All content, videos, PDFs, research material, and market data published on this platform are for <strong className="text-white/60">educational and informational purposes only</strong> and should not be construed as investment advice.
          </p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            We are in the process of obtaining <strong className="text-white/55">SEBI Registration</strong> as a Research Analyst / Investment Adviser. Until such registration is confirmed, we do not provide trade recommendations or personalized investment advice. Investing in securities is subject to market risk. Please read all documents carefully before investing.
          </p>
          <p className="text-[11px] text-white/30 leading-relaxed">
            SEBI Investor Helpline: 1800 22 7575 · complaints: <a href="https://scores.gov.in" className="text-[var(--gold)]/40 hover:text-[var(--gold)]">scores.gov.in</a>
          </p>
        </div>

        <p className="mt-5 text-xs text-white/30">
          © {new Date().getFullYear()} EquityMitra by Khichi Brothers. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
