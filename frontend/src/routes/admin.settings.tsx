import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, ExternalLink, Shield, Bell, Database } from "lucide-react";
export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });
function AdminSettings() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Settings & Info</h1>
        <p className="text-sm text-white/40 mt-1">Platform configuration reference. Edit via Railway environment variables.</p>
      </div>

      <div className="grid gap-4">
        {/* Environment Info */}
        <div className="rounded-xl border border-white/10 bg-card/60 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-[var(--gold)]" />
            <h2 className="text-sm font-bold text-white">Backend Configuration</h2>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">The following settings are managed via Railway environment variables. You do not need to redeploy to change them — most take effect on next server restart or within 60 seconds.</p>
          <div className="space-y-3">
            {[
              { label: "JWT_SECRET",              desc: "Required. Random string for signing auth tokens." },
              { label: "RAZORPAY_KEY_ID",         desc: "Razorpay Key ID (rzp_test_... or rzp_live_...)." },
              { label: "RAZORPAY_KEY_SECRET",     desc: "Razorpay Key Secret for signature verification." },
              { label: "RAZORPAY_WEBHOOK_SECRET", desc: "Webhook secret for validating payment callbacks." },
              { label: "MSG91_API_KEY",           desc: "MSG91 API Key for real SMS OTP delivery." },
              { label: "MSG91_TEMPLATE_ID",       desc: "MSG91 OTP template ID (required for SMS)." },
              { label: "ADMIN_PHONES",            desc: "Comma-separated phone numbers with admin access." },
              { label: "GOOGLE_CLIENT_ID",        desc: "Google OAuth Client ID for Google Login." },
              { label: "DATA_DIR",                desc: "SQLite database file location (e.g., /data)." },
            ].map((env) => (
              <div key={env.label} className="flex items-start gap-3 py-2 border-t border-white/5">
                <code className="text-[10px] text-[var(--gold)] bg-[var(--gold)]/10 px-2 py-0.5 rounded font-mono shrink-0 mt-0.5">{env.label}</code>
                <p className="text-xs text-white/50">{env.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-white/10 bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-4 w-4 text-[var(--gold)]" />
            <h2 className="text-sm font-bold text-white">Quick Links</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Railway Dashboard",    href: "https://railway.app" },
              { label: "Razorpay Dashboard",   href: "https://dashboard.razorpay.com" },
              { label: "MSG91 Dashboard",      href: "https://msg91.com/in/dashboard" },
              { label: "Google Cloud Console", href: "https://console.cloud.google.com" },
              { label: "SEBI SCORES",          href: "https://scores.gov.in" },
              { label: "NSE India",            href: "https://www.nseindia.com" },
            ].map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/60 hover:text-[var(--gold)] transition">
                <ExternalLink className="h-3 w-3" />{link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Notify Emails */}
        <div className="rounded-xl border border-white/10 bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-[var(--gold)]" />
            <h2 className="text-sm font-bold text-white">Trade Launch Notification List</h2>
          </div>
          <p className="text-xs text-white/50">Users who signed up for trade launch notifications can be viewed at <code className="text-[var(--gold)]/70 font-mono text-[10px] px-1.5 py-0.5 bg-[var(--gold)]/10 rounded">GET /api/admin/notify-emails</code></p>
        </div>
      </div>
    </div>
  );
}
