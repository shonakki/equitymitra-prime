import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/legal/refund")({ component: RefundPage });
function RefundPage() {
  return (
    <article className="text-white/80">
      <h1 className="text-2xl font-black text-white mb-2">Refund Policy</h1>
      <p className="text-xs text-white/35 mb-8">Last updated: June 2025</p>
      <div className="rounded-xl border border-white/10 bg-card/60 p-5 mb-8">
        <p className="text-sm text-white/70 leading-relaxed">EquityMitra sells digital educational content and subscriptions. Due to the nature of digital products, our refund policy is as described below. Please read carefully before purchasing.</p>
      </div>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">1. Subscription Plans (Monthly / Yearly)</h2>
      <p className="text-sm leading-relaxed mb-3">For monthly and yearly subscription plans (Starter, Premium, Premium Yearly):</p>
      <ul className="list-disc list-inside text-sm text-white/70 mb-4 space-y-1">
        <li>Refund requests made within <strong className="text-white">7 days</strong> of purchase may be considered if the content has not been substantially accessed.</li>
        <li>No refunds after 7 days of purchase.</li>
        <li>No partial refunds for unused days of a subscription period.</li>
      </ul>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">2. One-Time Programs (Beginner Academy, Founder Lifetime)</h2>
      <p className="text-sm leading-relaxed mb-3">For one-time lifetime or program purchases:</p>
      <ul className="list-disc list-inside text-sm text-white/70 mb-4 space-y-1">
        <li>Refund requests within <strong className="text-white">48 hours</strong> of purchase may be considered if no content has been accessed.</li>
        <li>Once course content has been accessed, no refund will be provided.</li>
        <li>In case of technical issues preventing access, we will first attempt to resolve the issue before considering a refund.</li>
      </ul>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">3. Failed Payments</h2>
      <p className="text-sm leading-relaxed mb-4">If your payment is charged but your plan is not activated within 24 hours, contact us immediately. We will either activate your plan or provide a full refund within 5-7 business days.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">4. How to Request a Refund</h2>
      <p className="text-sm leading-relaxed mb-2">To request a refund:</p>
      <ol className="list-decimal list-inside text-sm text-white/70 mb-4 space-y-1">
        <li>Email <a href="mailto:support@equitymitra.com" className="text-[var(--gold)]/70 hover:text-[var(--gold)]">support@equitymitra.com</a> with subject "Refund Request"</li>
        <li>Include your registered phone/email, plan purchased, and reason</li>
        <li>Include your Razorpay payment ID if available</li>
      </ol>
      <p className="text-sm leading-relaxed mb-4">We will respond within 2 business days. Approved refunds are processed within 5-7 business days to the original payment method.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">5. Non-Refundable Situations</h2>
      <ul className="list-disc list-inside text-sm text-white/70 mb-4 space-y-1">
        <li>Accounts suspended or terminated for Terms violation</li>
        <li>Requests after the refund window</li>
        <li>Change of mind after content access</li>
        <li>Promotional or discounted purchases</li>
      </ul>
    </article>
  );
}
