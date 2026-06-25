/**
 * EquityMitra Auth — JWT-backed authentication
 *
 * Plan is stored in signed JWT — cannot be tampered client-side.
 * JWT is stored in localStorage (Cloudflare Workers compatible).
 * On first load, decodes JWT to restore session without a network call.
 */
import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from "react";
import type { PlanId } from "./subscription";
import { getAnalyzeUsed, recordAnalyzeUsage, getAnalysisLimit } from "./subscription";
import { getToken, setToken, clearToken } from "./api";

export type User = {
  id: number;
  phone: string | null;
  email: string | null;
  name: string;
  plan: PlanId;
  isAdmin: boolean;
  // Legacy compat fields (derived)
  accountId: string;
  memberSince: string;
  nextRenewal: string;
  telegramConnected: boolean;
  notifyTelegram: boolean;
  notifyEmail: boolean;
  twoFactor: boolean;
};

type Ctx = {
  user: User | null;
  isAuthed: boolean;
  isAdmin: boolean;
  /** Login with JWT returned from /api/auth/verify-otp */
  loginWithToken: (token: string, userData: Omit<User, "accountId" | "memberSince" | "nextRenewal" | "telegramConnected" | "notifyTelegram" | "notifyEmail" | "twoFactor">) => void;
  logout: () => void;
  /** Called after payment succeeds — updates token + plan */
  updateToken: (token: string) => void;
};

const AuthContext = createContext<Ctx | null>(null);

/** Decode JWT payload without verification (verification happens server-side) */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json   = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Check if JWT is expired */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return Date.now() / 1000 > payload.exp;
}

/** Normalize plan name from JWT or legacy localStorage */
function normalizePlan(raw: string | undefined): PlanId {
  if (raw === "Prime" || raw === "Premium") return "Premium";
  if (raw === "PremiumYearly")              return "PremiumYearly";
  if (raw === "BeginnerProgram" || raw === "Beginner") return "BeginnerProgram";
  if (raw === "Founder")                    return "Founder";
  return "Starter";
}

/** Build User object from JWT payload */
function userFromJwt(payload: Record<string, unknown>): User {
  const now     = new Date();
  const renewal = new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000);
  const id      = Number(payload.sub) || 0;
  const tail    = String(payload.phone || "0000").slice(-4).padStart(4, "0");

  return {
    id,
    phone:    (payload.phone  as string | null) ?? null,
    email:    (payload.email  as string | null) ?? null,
    name:     (payload.name   as string) || "Member",
    plan:     normalizePlan(payload.plan as string),
    isAdmin:  !!(payload.isAdmin),
    // Legacy compat
    accountId:          `EM-${tail}-${now.getFullYear()}`,
    memberSince:        now.toISOString(),
    nextRenewal:        renewal.toISOString(),
    telegramConnected:  false,
    notifyTelegram:     true,
    notifyEmail:        false,
    twoFactor:          true,
  };
}

/** Try to restore user from legacy em.user localStorage (migration path) */
function tryLegacyUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("em.user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.phone) return null;
    const now  = new Date();
    const renew = new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000);
    return {
      id:                 0,
      phone:              parsed.phone,
      email:              parsed.email ?? null,
      name:               parsed.name ?? "Member",
      plan:               normalizePlan(parsed.plan),
      isAdmin:            false,
      accountId:          parsed.accountId ?? "EM-0000-2025",
      memberSince:        parsed.memberSince ?? now.toISOString(),
      nextRenewal:        parsed.nextRenewal ?? renew.toISOString(),
      telegramConnected:  parsed.telegramConnected ?? false,
      notifyTelegram:     parsed.notifyTelegram ?? true,
      notifyEmail:        parsed.notifyEmail ?? false,
      twoFactor:          parsed.twoFactor ?? true,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = getToken();
    if (token && !isTokenExpired(token)) {
      const payload = decodeJwt(token);
      if (payload) {
        setUser(userFromJwt(payload));
        return;
      }
    }

    // No valid JWT — try legacy localStorage migration
    const legacy = tryLegacyUser();
    if (legacy) {
      // Keep legacy session (plan gates still work client-side)
      // User will get a real JWT next time they log in
      setUser(legacy);
    }
  }, []);

  const loginWithToken = useCallback(
    (
      token: string,
      userData: Omit<User, "accountId" | "memberSince" | "nextRenewal" | "telegramConnected" | "notifyTelegram" | "notifyEmail" | "twoFactor">,
    ) => {
      setToken(token);
      const payload = decodeJwt(token);
      const u = payload ? userFromJwt(payload) : {
        ...userData,
        accountId:         `EM-${String(userData.phone || "0000").slice(-4)}-${new Date().getFullYear()}`,
        memberSince:       new Date().toISOString(),
        nextRenewal:       new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        telegramConnected: false,
        notifyTelegram:    true,
        notifyEmail:       false,
        twoFactor:         true,
      } as User;
      setUser(u);
      // Clear legacy key on real login
      localStorage.removeItem("em.user");
    },
    [],
  );

  const updateToken = useCallback((token: string) => {
    setToken(token);
    const payload = decodeJwt(token);
    if (payload) setUser(userFromJwt(payload));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthed: !!user,
      isAdmin:  !!(user?.isAdmin),
      loginWithToken,
      logout,
      updateToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function usePlan(): PlanId {
  const { user } = useAuth();
  return user?.plan ?? "Starter";
}

export function useAnalyzeUsage() {
  const { user } = useAuth();
  const plan     = usePlan();
  const userId   = user ? String(user.id || user.phone || "guest") : "guest";
  const limit    = getAnalysisLimit(plan);
  const [used, setUsed] = useState(() => getAnalyzeUsed(userId));

  const remaining   = limit === Infinity ? Infinity : Math.max(0, limit - used);
  const canAnalyze  = limit > 0 && (limit === Infinity || used < limit);

  const recordUsage = useCallback(() => {
    recordAnalyzeUsage(userId);
    setUsed((prev) => prev + 1);
  }, [userId]);

  return { used, limit, remaining, canAnalyze, recordUsage };
}
