/**
 * Lightweight client-side auth stub.
 *
 * Real OTP auth (Lovable Cloud + SMS provider) plugs in by replacing
 * `login` / `logout`. The `/app` guard keeps working.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = {
  phone: string;
  name?: string;
  email?: string;
  plan: "Basic" | "Prime" | "Free";
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
    plan: "Prime",
    accountId: `EM-${tail}-${now.getFullYear()}`,
    memberSince: now.toISOString(),
    nextRenewal: renewal.toISOString(),
    telegramConnected: false,
    notifyTelegram: true,
    notifyEmail: false,
    twoFactor: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        // Backfill missing fields for existing localStorage users
        const merged: User = { ...buildUser(parsed.phone ?? ""), ...parsed };
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

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
