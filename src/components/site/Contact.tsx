import { Mail, Send, MessageCircle } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

export function Contact() {
  return (
    <section id="contact" className="relative py-20 sm:py-24 border-t border-white/5">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Get in touch"
          title="We're here to help"
          description="Reach out for membership questions, course doubts or partnership enquiries."
        />
        <div className="grid sm:grid-cols-3 gap-4">
          <a
            href="mailto:support@equitymitra.com"
            className="rounded-xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/40 transition"
          >
            <Mail className="h-5 w-5 text-[var(--gold)]" />
            <h3 className="mt-3 text-sm font-semibold text-white">Email</h3>
            <p className="mt-1 text-xs text-white/55">support@equitymitra.com</p>
          </a>
          <a
            href="https://t.me/equitymitra"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/40 transition"
          >
            <Send className="h-5 w-5 text-[var(--gold)]" />
            <h3 className="mt-3 text-sm font-semibold text-white">Telegram</h3>
            <p className="mt-1 text-xs text-white/55">Join the free community</p>
          </a>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/40 transition"
          >
            <MessageCircle className="h-5 w-5 text-[var(--gold)]" />
            <h3 className="mt-3 text-sm font-semibold text-white">WhatsApp</h3>
            <p className="mt-1 text-xs text-white/55">Mon–Sat · 9 AM to 7 PM</p>
          </a>
        </div>
      </div>
    </section>
  );
}
