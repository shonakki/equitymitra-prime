import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Crown, Phone, Mail, Bell, Shield, LogOut, Send, User as UserIcon, Hash, Calendar, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/account")({
  component: AccountPage,
});

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const displayName = user?.name?.trim() ? user.name : "Member";
  const displayEmail = user?.email?.trim() ? user.email : "Not Added";
  const displayPhone = user?.phone ? `+91 ${user.phone}` : "Not Added";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <PageHeader
        eyebrow="Account"
        title="My Account"
        description="Manage your profile, subscription and notification preferences."
      />

      <div className="grid md:grid-cols-3 gap-4">
        {/* Profile card */}
        <div className="md:col-span-1 rounded-xl border border-white/10 bg-card/60 p-5 text-center">
          <div className="mx-auto h-20 w-20 rounded-full gold-gradient grid place-items-center text-2xl font-black text-black">
            {displayName[0]}
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">{displayName}</h3>
          <p className="text-xs text-white/45">{displayPhone}</p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full gold-gradient text-black text-[10px] font-bold px-2.5 py-1">
            <Crown className="h-3 w-3" /> {user?.plan ?? "Prime"} Member
          </span>
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-left">
            <Mini label="Account ID" value={user?.accountId ?? "—"} mono />
            <Mini label="Member Since" value={fmtDate(user?.memberSince)} />
            <Mini label="Status" value="Active" accent="text-emerald-400" />
          </div>
        </div>

        {/* Settings */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/10 bg-card/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Profile</h3>
            <div className="space-y-3">
              <Row icon={UserIcon} label="Name" value={displayName} />
              <Row icon={Phone} label="Mobile" value={displayPhone} />
              <Row icon={Mail} label="Email" value={displayEmail} muted={displayEmail === "Not Added"} />
              <Row icon={Hash} label="Account ID" value={user?.accountId ?? "—"} />
              <Row icon={Calendar} label="Member Since" value={fmtDate(user?.memberSince)} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Connections & Preferences</h3>
            <ToggleRow
              icon={Send}
              label="Telegram connected"
              checked={!!user?.telegramConnected}
              sub={user?.telegramConnected ? "Linked to your account" : "Tap to link"}
            />
            <ToggleRow icon={Bell} label="Trade alerts on Telegram" checked={user?.notifyTelegram ?? true} />
            <ToggleRow icon={Bell} label="Daily morning brief (email)" checked={user?.notifyEmail ?? false} />
            <ToggleRow icon={Shield} label="Two-factor auth on login" checked={user?.twoFactor ?? true} />
          </div>

          <div className="rounded-xl border border-[var(--gold)]/25 bg-gradient-to-b from-[var(--gold)]/10 to-card/60 p-5">
            <h3 className="text-sm font-semibold gold-text">Subscription</h3>
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              <Stat label="Current Plan" value={user?.plan ?? "Prime"} accent />
              <Stat label="Status" value="Active" />
              <Stat label="Next Renewal" value={fmtDate(user?.nextRenewal)} icon={RefreshCw} />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md gold-gradient text-black text-xs font-semibold px-3 py-1.5">Manage Plan</button>
              <button className="rounded-md border border-white/15 text-white text-xs font-semibold px-3 py-1.5 hover:bg-white/5">Billing History</button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold py-2.5 hover:bg-red-500/20 transition"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/45">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${accent ?? "text-white"}`}>{value}</span>
    </div>
  );
}

function Row({ icon: Icon, label, value, muted }: { icon: any; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-2.5">
      <Icon className="h-4 w-4 text-[var(--gold)]" />
      <span className="text-xs text-white/50 w-24">{label}</span>
      <span className={`text-sm ${muted ? "text-white/40 italic" : "text-white"}`}>{value}</span>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, checked = false, sub }: { icon: any; label: string; checked?: boolean; sub?: string }) {
  return (
    <label className="flex items-center gap-3 py-2.5 cursor-pointer">
      <Icon className="h-4 w-4 text-[var(--gold)]" />
      <span className="flex-1">
        <span className="text-sm text-white/85 block">{label}</span>
        {sub && <span className="text-[11px] text-white/40">{sub}</span>}
      </span>
      <span className={`relative inline-block h-5 w-9 rounded-full transition ${checked ? "bg-[var(--gold)]" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? "left-4" : "left-0.5"}`} />
      </span>
    </label>
  );
}

function Stat({ label, value, accent, icon: Icon }: { label: string; value: string; accent?: boolean; icon?: any }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-3">
      <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
      <p className={`mt-1 text-sm font-bold inline-flex items-center gap-1.5 ${accent ? "gold-text" : "text-white"}`}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {value}
      </p>
    </div>
  );
}
