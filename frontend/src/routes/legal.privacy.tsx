import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/legal/privacy")({ component: PrivacyPage });
function PrivacyPage() {
  return (
    <article className="text-white/80">
      <h1 className="text-2xl font-black text-white mb-2">Privacy Policy</h1>
      <p className="text-xs text-white/35 mb-8">Last updated: June 2025</p>
      <p className="text-sm leading-relaxed mb-6">EquityMitra is committed to protecting your privacy. This Policy explains what data we collect, how we use it, and your rights regarding your personal information.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">1. Data We Collect</h2>
      <p className="text-sm leading-relaxed mb-2">We collect the following information when you use EquityMitra:</p>
      <ul className="list-disc list-inside text-sm leading-relaxed mb-4 space-y-1 text-white/70">
        <li><strong className="text-white/90">Contact information</strong>: Mobile number or email address used for OTP login</li>
        <li><strong className="text-white/90">Profile data</strong>: Name (if provided)</li>
        <li><strong className="text-white/90">Payment data</strong>: Transaction records (we never store card details — processed by Razorpay)</li>
        <li><strong className="text-white/90">Usage data</strong>: Pages visited, features accessed, session duration</li>
        <li><strong className="text-white/90">Device info</strong>: Browser type, OS, IP address</li>
      </ul>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">2. How We Use Your Data</h2>
      <ul className="list-disc list-inside text-sm leading-relaxed mb-4 space-y-1 text-white/70">
        <li>Authenticate your identity via OTP login</li>
        <li>Process and manage your subscription</li>
        <li>Send important account or service notifications</li>
        <li>Improve platform features and user experience</li>
        <li>Comply with legal obligations</li>
      </ul>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">3. Data Sharing</h2>
      <p className="text-sm leading-relaxed mb-4">We do not sell your personal data. We share data only with: (a) Razorpay for payment processing, (b) SMS providers for OTP delivery, (c) cloud hosting providers, and (d) law enforcement when legally required.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">4. Data Retention</h2>
      <p className="text-sm leading-relaxed mb-4">We retain your account data for as long as your account is active or as needed to provide services. Payment records are retained for 7 years as required by Indian accounting regulations. You may request deletion of your account by contacting support.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">5. Cookies & Storage</h2>
      <p className="text-sm leading-relaxed mb-4">EquityMitra uses browser localStorage to maintain your session (JWT token) and preferences. We do not use third-party advertising cookies.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">6. Your Rights</h2>
      <ul className="list-disc list-inside text-sm leading-relaxed mb-4 space-y-1 text-white/70">
        <li>Right to access your personal data</li>
        <li>Right to correct inaccurate data</li>
        <li>Right to delete your account</li>
        <li>Right to data portability</li>
      </ul>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">7. Security</h2>
      <p className="text-sm leading-relaxed mb-4">We use industry-standard security measures: OTP authentication, JWT tokens, HTTPS encryption, and no storage of payment card data. Despite these measures, no system is 100% secure.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-3">8. Contact</h2>
      <p className="text-sm leading-relaxed mb-4">For privacy-related queries, contact us at: <a href="mailto:privacy@equitymitra.com" className="text-[var(--gold)]/70 hover:text-[var(--gold)]">privacy@equitymitra.com</a></p>
    </article>
  );
}
