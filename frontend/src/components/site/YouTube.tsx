import { SectionHeader } from "./SectionHeader";
import { Play, Youtube as YT, Send } from "lucide-react";

const VIDEOS = [
  { t: "How I read order flow in 5 minutes", v: "12:42" },
  { t: "Volume Analysis — confirming every move", v: "18:05" },
  { t: "Risk management mistakes that kill accounts", v: "09:31" },
];

export function YouTube() {
  return (
    <section id="youtube" className="relative py-16 sm:py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="YouTube"
          title="Watch us break down the markets"
        />
        <div className="grid md:grid-cols-3 gap-5">
          {VIDEOS.map((v) => (
            <a
              key={v.t}
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-card/60 overflow-hidden hover:border-[var(--gold)]/40 transition"
            >
              <div className="relative aspect-video bg-black/60 grid place-items-center">
                <div className="h-12 w-12 rounded-full gold-gradient grid place-items-center text-black">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                  {v.v}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-white">{v.t}</h3>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition"
          >
            <YT className="h-4 w-4" /> Subscribe on YouTube
          </a>
          <a
            href="https://t.me/equitymitra"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#229ED9] hover:bg-[#1e8bbf] px-5 py-2.5 text-sm font-semibold text-white transition"
          >
            <Send className="h-4 w-4" /> Join Free Telegram Community
          </a>
        </div>
      </div>
    </section>
  );
}
