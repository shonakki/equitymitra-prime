import { useState, useEffect } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "#learn", label: "Academy" },
  { href: "#youtube", label: "YouTube" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthed } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled ? "bg-background/85 backdrop-blur border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <a href="#top" className="leading-tight">
          <div className="font-bold tracking-widest text-white text-sm">
            EQUITY<span className="gold-text">MITRA</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/60">
            by Khichi Brothers
          </div>
        </a>
        <ul className="hidden lg:flex items-center gap-6 text-sm text-white/75">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-[var(--gold)] transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to={isAuthed ? "/app/market" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 text-white text-xs font-semibold px-3 py-1.5 hover:bg-white/5 transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            {isAuthed ? "Login" : "Login"}
          </Link>
          <a
            href="#pricing"
            className="rounded-md gold-gradient px-3.5 py-1.5 text-xs font-semibold text-black hover:opacity-90 transition"
          >
            Join Premium
          </a>
        </div>
        <button
          className="lg:hidden text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-background/95 backdrop-blur">
          <ul className="flex flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-white/80 hover:text-[var(--gold)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2 flex gap-2">
              <Link
                to={isAuthed ? "/app/market" : "/login"}
                onClick={() => setOpen(false)}
                className="flex-1 text-center rounded-md border border-white/15 text-white text-xs font-semibold px-3 py-2"
              >
                {isAuthed ? "Login" : "Login"}
              </Link>
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="flex-1 text-center rounded-md gold-gradient text-black text-xs font-semibold px-3 py-2"
              >
                Join Premium
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
