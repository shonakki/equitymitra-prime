/**
 * Lightweight client-side auth stub.
 *
 * Real OTP auth plugs in by replacing
 * `login` / `logout`. The `/app` guard keeps working.
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { PlanId } from "./subscription";
import { getAnalyzeUsed, recordAnalyzeUsage, getAnalysisLimit } from "./subscription";

export type User = {
  phone: string;
  name?: string;
  email?: string;
  /** Canonical plan ID */
  plan: PlanId;
  accountId: string;
  memberSince: string; // ISO date
  nextRenewal: string; // ISO date
  telegramConnected: boolean;
  notifyTelegram: boolean;
  notifyEmail: boolean;
  twoFactor: boolean;
};

type Ctx = {
  user: User | null;
  isAuthed: boolean;
  login: (phone: string) => void;
  logout: () => void;
  /** Dev-only: switch plan without re-logging in */
  setPlan: (plan: PlanId) => void;
  /** Dev-only: switch member-since date to test monthly release gates */
  setMemberSince: (isoDate: string) => void;
};

const AuthContext = createContext<Ctx | null>(null);
const KEY = "em.user";

function buildUser(phone: string): User {
  const now = new Date();
  const renewal = new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000);
  const tail = phone.slice(-4).padStart(4, "0");
  return {
    phone,
    name: "Member",
    // Default plan for new logins — change here for testing
    plan: "Starter",
    accountId: `EM-${tail}-${now.getFullYear()}`,
    memberSince: now.toISOString(),
    nextRenewal: renewal.toISOString(),
    telegramConnected: false,
    notifyTelegram: true,
    notifyEmail: false,
    twoFactor: true,
  };
}

/** Normalize legacy plan names → PlanId */
function normalizePlan(raw: string | undefined): PlanId {
  if (raw === "Prime" || raw === "Premium") return "Premium";
  if (raw === "PremiumYearly") return "PremiumYearly";
  if (raw === "BeginnerProgram" || raw === "Beginner") return "BeginnerProgram";
  if (raw === "Founder") return "Founder";
  return "Starter";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const base = buildUser(parsed.phone ?? "");
        const merged: User = {
          ...base,
          ...parsed,
          plan: normalizePlan(parsed.plan),
        };
        setUser(merged);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const login = (phone: string) => {
    const u = buildUser(phone);
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  const setPlan = useCallback((plan: PlanId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, plan };
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setMemberSince = useCallback((isoDate: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, memberSince: isoDate };
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, login, logout, setPlan, setMemberSince }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Returns current plan, defaulting to Starter when unauthenticated */
export function usePlan(): PlanId {
  const { user } = useAuth();
  return user?.plan ?? "Starter";
}

/** Analyse usage for the current user/month */
export function useAnalyzeUsage() {
  const { user } = useAuth();
  const plan = usePlan();
  const userId = user?.accountId ?? "guest";
  const limit = getAnalysisLimit(plan);
  const [used, setUsed] = useState(() => getAnalyzeUsed(userId));

  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
  const canAnalyze = limit > 0 && (limit === Infinity || used < limit);

  const recordUsage = useCallback(() => {
    recordAnalyzeUsage(userId);
    setUsed((prev) => prev + 1);
  }, [userId]);

  return { used, limit, remaining, canAnalyze, recordUsage };
}
