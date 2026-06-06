import { useEffect, useState, type FormEvent } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EquityMitra — Learn Trading Professionally" },
      { name: "description", content: "EquityMitra — Learn Trading Professionally. Daily stock analysis, weekly picks, and pro-level courses on Price Action, ATE Price & Volume & Risk Management." },
      { name: "author", content: "EquityMitra" },
      { property: "og:title", content: "EquityMitra — Learn Trading Professionally" },
      { property: "og:description", content: "EquityMitra — Learn Trading Professionally. Daily stock analysis, weekly picks, and pro-level courses on Price Action, ATE Price & Volume & Risk Management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "EquityMitra — Learn Trading Professionally" },
      { name: "twitter:description", content: "EquityMitra — Learn Trading Professionally. Daily stock analysis, weekly picks, and pro-level courses on Price Action, ATE Price & Volume & Risk Management." },
      { property: "og:image", content: "https://www.equitymitra.com/og-image.png" },
      { name: "twitter:image", content: "https://www.equitymitra.com/og-image.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const PASSWORD = "Akash123";
const AUTH_KEY = "EquityMitraAccess";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_KEY) : null;
    if (stored === "unlocked") {
      setIsUnlocked(true);
    }
    setCheckedStorage(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordValue === PASSWORD) {
      window.localStorage.setItem(AUTH_KEY, "unlocked");
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const isLocked = checkedStorage && !isUnlocked;

  if (!checkedStorage) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-2xl backdrop-blur text-center text-white">
              Checking access...
            </div>
          </div>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isLocked ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-2xl backdrop-blur">
              <h1 className="text-2xl font-bold text-white">Enter Password</h1>
              <p className="mt-3 text-sm text-white/60">
                Please enter the site password to continue.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-white/80">
                  Password
                  <input
                    type="password"
                    value={passwordValue}
                    onChange={(event) => setPasswordValue(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                    autoFocus
                  />
                </label>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[var(--gold)]/90"
                >
                  Unlock Site
                </button>
              </form>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
