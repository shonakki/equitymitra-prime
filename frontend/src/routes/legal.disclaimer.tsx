import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/disclaimer")({ component: DisclaimerPage });

function DisclaimerPage() {
  return (
    <article className="text-white/80">
      <h1 className="text-2xl font-black text-white mb-2">General Disclaimer</h1>
      <p className="text-xs text-white/35 mb-8">Last updated: June 2025</p>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8">
        <p className="text-sm text-amber-300 font-semibold leading-relaxed">
          ⚠️ EquityMitra is an educational and investor awareness platform. We do NOT provide SEBI-registered investment advice, financial planning, or trade recommendations. All content is for educational purposes only.
        </p>
      </div>

      <h2 className="text-lg font-bold text-white mt-6 mb-3">1. Educational Purpose Only</h2>
      <p className="text-sm leading-relaxed mb-4">
        All information, analysis, videos, PDFs, articles, research material, and any other content provided by EquityMitra is for general educational and informational purposes only. Nothing on this platform constitutes investment advice, financial advice, trading advice, or any other type of advice.
      </p>

      <h2 className="text-lg font-bold text-white mt-6 mb-3">2. Not SEBI Registered (Currently)</h2>
      <p className="text-sm leading-relaxed mb-4">
        EquityMitra is currently in the process of obtaining SEBI registration as a Research Analyst / Investment Adviser. Until such registration is obtained and confirmed, we do not provide any trade recommendations, buy/sell calls, or personalized investment advice. Any historical references to trade setups are for educational illustration only.
      </p>

      <h2 className="text-lg font-bold text-white mt-6 mb-3">3. No Guarantee of Returns</h2>
      <p className="text-sm leading-relaxed mb-4">
        Past performance of any stock, market, or financial instrument discussed on EquityMitra does not guarantee or predict future results. Stock market investments are subject to market risk. Please read all scheme-related documents carefully before investing.
      </p>

      <h2 className="text-lg font-bold text-white mt-6 mb-3">4. Do Your Own Research</h2>
      <p className="text-sm leading-relaxed mb-4">
        Any information or analysis provided on this platform should not be acted upon without independent verification and/or consultation with a SEBI-registered investment advisor. You are solely responsible for your investment decisions.
      </p>

      <h2 className="text-lg font-bold text-white mt-6 mb-3">5. Market Data Disclaimer</h2>
      <p className="text-sm leading-relaxed mb-4">
        Market data displayed on EquityMitra is sourced from third-party providers and Angel One SmartAPI. While we strive for accuracy, we do not guarantee the accuracy, completeness, or timeliness of any market data. Data may be delayed or inaccurate.
      </p>

      <h2 className="text-lg font-bold text-white mt-6 mb-3">6. Subscription Disclaimer</h2>
      <p className="text-sm leading-relaxed mb-4">
        EquityMitra subscription fees are charged for access to educational content, learning materials, and investor awareness programs — not for investment advice or trade recommendations. Subscribing to any plan does not constitute or imply a guaranteed return on investment.
      </p>

      <h2 className="text-lg font-bold text-white mt-6 mb-3">7. Affiliate & Content Disclaimer</h2>
      <p className="text-sm leading-relaxed mb-4">
        Some links or references on EquityMitra may be to third-party platforms, brokers, or services. EquityMitra may receive compensation for referrals. This does not imply endorsement of those services.
      </p>

      <div className="mt-10 rounded-xl border border-white/10 bg-card/60 p-5 text-xs text-white/40 leading-relaxed">
        <strong className="text-white/60">SEBI Regulation:</strong> Investment in securities market is subject to market risk, read all related documents carefully before investing. EquityMitra is an investor education and awareness platform.
        Registration with SEBI as Investment Adviser/Research Analyst does not guarantee returns or accuracy of advice/research.
      </div>
    </article>
  );
}
