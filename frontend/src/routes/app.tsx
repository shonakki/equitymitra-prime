import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (region === "US") {
      const nonFunctional = [
        "/app/analyze",
        "/app/trades",
        "/app/portfolio",
        "/app/performance",
        "/app/learning",
        "/app/beginner",
        "/app/founder",
        "/app/notes",
      ];
      if (nonFunctional.includes(pathname)) {
        const featureKey = pathname.replace("/app/", "");
        navigate({
          to: "/app/coming-soon",
          search: { feature: featureKey } as any,
        });
      }
    } else if (region === "IN" && pathname === "/app/coming-soon") {
      const searchParams = new URLSearchParams(window.location.search);
      const feature = searchParams.get("feature");
      if (feature) {
        navigate({ to: `/app/${feature}` });
      } else {
        navigate({ to: "/app/market" });
      }
    }
  }, [region, pathname, navigate]);

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
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50">
            <AppSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

