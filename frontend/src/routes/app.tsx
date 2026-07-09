import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AppSidebar } from "@/components/app/AppSidebar";
import { TopBar } from "@/components/app/TopBar";
import { useAuth } from "@/lib/auth";
import { RegionProvider, useRegion } from "@/lib/region";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RegionProvider>
      <AppLayoutContent isAuthed={isAuthed} navigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    </RegionProvider>
  );
}

function AppLayoutContent({
  isAuthed,
  navigate,
  mobileOpen,
  setMobileOpen,
}: {
  isAuthed: boolean;
  navigate: ReturnType<typeof useNavigate>;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  const { region } = useRegion();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Client-side gate. Auth state hydrates from localStorage on mount.
    const t = setTimeout(() => {
      if (!isAuthed && pathname !== "/app/research-hub") navigate({ to: "/login" });
    }, 50);
    return () => clearTimeout(t);
  }, [isAuthed, navigate, pathname]);



  if (!isAuthed && pathname !== "/app/research-hub") {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-white/60 text-sm">
        Loading Login…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      {region !== "US" && (
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
      )}

      {/* Mobile sidebar */}
      {mobileOpen && region !== "US" && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50">
            <AppSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 flex flex-col">
          {region === "US" ? <UsaVyngContainer /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

function UsaVyngContainer() {
  const [loadFailed, setLoadFailed] = useState(false);

  if (loadFailed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-2xl border border-[var(--gold)]/25 bg-gradient-to-b from-[var(--gold)]/10 to-card/60 p-8 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20">
            <ExternalLink className="h-8 w-8 text-[var(--gold)]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">USA Platform is Ready</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              For security reasons, the USA platform needs to be opened in a new secure window.
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = "https://www.vyng.io";
            }}
            className="w-full gold-gradient text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Open USA Platform
          </button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src="https://www.vyng.io"
      className="w-full flex-1 border-0 bg-white"
      title="USA Platform"
      onError={() => setLoadFailed(true)}
    />
  );
}
