import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/legal/risk")({ component: RiskPage });
function RiskPage() {
  return (
    <article className="text-white/80">
      <h1 className="text-2xl font-black text-white mb-2">Risk Disclosure</h1>
      <p className="text-xs text-white/35 mb-8">Last updated: June 2025</p>
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 mb-8">
        <p className="text-sm text-red-300 font-semibold leading-relaxed">⚠️ Investment in securities market is subject to market risk. Read all related documents carefully before investing. Past performance is not indicative of future results.</p>
      </div>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">1. Market Risk</h2>
      <p className="text-sm leading-relaxed mb-4">Stock markets are subject to volatility. Prices of securities can fall as well as rise. You may lose some or all of your invested capital. Market conditions can change rapidly due to economic, political, regulatory, or other factors.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">2. Educational Content Risk</h2>
      <p className="text-sm leading-relaxed mb-4">All educational content, market analysis, technical analysis, and research material on EquityMitra is for learning purposes only. This content does not constitute personalized investment advice. Acting on educational content without proper due diligence can result in financial loss.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">3. Equity & Derivatives Risk</h2>
      <ul className="list-disc list-inside text-sm text-white/70 mb-4 space-y-1">
        <li><strong className="text-white">Equity</strong>: Subject to company-specific risk, sector risk, and broad market risk. Investments may not recover.</li>
        <li><strong className="text-white">F&O (Futures & Options)</strong>: Derivatives carry significantly higher risk than equities. Losses can exceed your initial investment. These instruments are suitable only for experienced investors who understand leverage risk.</li>
        <li><strong className="text-white">Mid & Small Cap</strong>: Higher volatility and liquidity risk compared to large-cap stocks.</li>
      </ul>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">4. Liquidity Risk</h2>
      <p className="text-sm leading-relaxed mb-4">Some securities discussed on EquityMitra may have low trading volumes, making it difficult to enter or exit positions at desired prices. This is particularly relevant for small-cap and micro-cap stocks.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">5. No Guarantee</h2>
      <p className="text-sm leading-relaxed mb-4">EquityMitra makes no warranty or representation regarding the accuracy of any analysis, the profitability of any strategy, or the suitability of any security for any investor. All educational content is provided on an "as is" basis without any guarantee.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">6. Consult a Professional</h2>
      <p className="text-sm leading-relaxed mb-4">Before making any investment decision, we strongly recommend consulting a SEBI-registered Investment Adviser or financial planner who understands your individual financial situation, risk tolerance, and investment goals.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">7. Regulatory Risk</h2>
      <p className="text-sm leading-relaxed mb-4">Changes in SEBI regulations, tax laws, or government policies can significantly impact the value of investments. Stay updated with regulatory changes from SEBI (www.sebi.gov.in) and AMFI (www.amfiindia.com).</p>
      <div className="mt-10 rounded-xl border border-white/10 bg-card/60 p-5 text-xs text-white/40 leading-relaxed">
        <strong className="text-white/60">SEBI Investor Grievance:</strong> SEBI Toll Free: 1800 22 7575 | www.scores.gov.in for registering complaints. NSE: www.nseindia.com | BSE: www.bseindia.com
      </div>
    </article>
  );
}
