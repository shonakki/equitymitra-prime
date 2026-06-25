import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/legal/terms")({ component: TermsPage });
function TermsPage() {
  return (
    <article className="text-white/80">
      <h1 className="text-2xl font-black text-white mb-2">Terms & Conditions</h1>
      <p className="text-xs text-white/35 mb-8">Last updated: June 2025</p>
      <p className="text-sm leading-relaxed mb-6">By accessing or using the EquityMitra platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">1. Acceptance of Terms</h2>
      <p className="text-sm leading-relaxed mb-4">By registering, subscribing, or using any feature of EquityMitra, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please do not use the platform.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">2. Platform Purpose</h2>
      <p className="text-sm leading-relaxed mb-4">EquityMitra is an <strong className="text-white">educational and investor awareness platform</strong>. It provides learning content including videos, PDFs, market data, and research material for educational purposes only. It does not provide SEBI-registered investment advice.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">3. User Eligibility</h2>
      <p className="text-sm leading-relaxed mb-4">You must be at least 18 years of age to use EquityMitra. By using the platform, you represent that you meet this requirement and that you are legally capable of entering into binding contracts.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">4. Account & Security</h2>
      <p className="text-sm leading-relaxed mb-4">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify EquityMitra immediately of any unauthorized access. EquityMitra is not liable for any loss arising from unauthorized use of your account.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">5. Subscription & Payment</h2>
      <p className="text-sm leading-relaxed mb-4">Subscription fees are charged for access to educational content only. All payments are processed through Razorpay. By subscribing, you authorize the charge for the selected plan. Subscription plans may be modified with reasonable notice.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">6. Intellectual Property</h2>
      <p className="text-sm leading-relaxed mb-4">All content on EquityMitra — including videos, PDFs, analyses, course material, and design — is the intellectual property of EquityMitra / Khichi Brothers. Unauthorized reproduction, distribution, or resale is strictly prohibited.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">7. Prohibited Activities</h2>
      <p className="text-sm leading-relaxed mb-4">You agree not to: share your login credentials, redistribute paid content, attempt to reverse-engineer the platform, use automated tools to scrape data, or use the platform for any unlawful purpose.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">8. Limitation of Liability</h2>
      <p className="text-sm leading-relaxed mb-4">EquityMitra shall not be liable for any financial losses, investment losses, or damages of any kind arising from use of the platform. Our total liability is limited to the subscription amount paid in the last 30 days.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">9. Termination</h2>
      <p className="text-sm leading-relaxed mb-4">EquityMitra reserves the right to suspend or terminate accounts that violate these Terms. Upon termination, access to content ceases immediately. Refunds are subject to our Refund Policy.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">10. Governing Law</h2>
      <p className="text-sm leading-relaxed mb-4">These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in [City], India.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">11. Changes to Terms</h2>
      <p className="text-sm leading-relaxed mb-4">EquityMitra may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
      <div className="mt-10 rounded-xl border border-white/10 bg-card/60 p-5 text-xs text-white/40 leading-relaxed">
        For questions about these Terms, contact us at support@equitymitra.com.
      </div>
    </article>
  );
}
