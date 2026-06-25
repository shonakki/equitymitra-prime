/**
 * India / USA Region Context
 * Persisted to localStorage. Consumed by TopBar and regional route wrappers.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Region = "IN" | "US";

type RegionCtx = {
  region: Region;
  setRegion: (r: Region) => void;
};

const RegionContext = createContext<RegionCtx>({ region: "IN", setRegion: () => {} });
const STORAGE_KEY = "em.region";

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>("IN");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as Region | null;
    if (stored === "IN" || stored === "US") setRegionState(stored);
  }, []);

  const setRegion = (r: Region) => {
    setRegionState(r);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, r);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  return useContext(RegionContext);
}
