import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login_/google-callback")({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;

        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        const searchParams = new URLSearchParams(search);

        // Check if Google returned an error
        const oauthError = hashParams.get("error") || searchParams.get("error");
        if (oauthError) {
          throw new Error(decodeURIComponent(oauthError));
        }

        // Extract ID token
        const idToken = hashParams.get("id_token") || searchParams.get("id_token");
        if (!idToken) {
          throw new Error("No ID token returned from Google.");
        }

        // Authenticate with backend
        const res = await api.post<{
          ok: boolean;
          token: string;
          user: {
            id: number;
            phone: string | null;
            email: string | null;
            name: string;
            plan: string;
            isAdmin: boolean;
          };
        }>("/api/auth/google", {
          idToken,
          deviceInfo: navigator.userAgent,
        });

        // Set session
        loginWithToken(res.token, {
          id: res.user.id,
          phone: res.user.phone,
          email: res.user.email,
          name: res.user.name,
          plan: res.user.plan as any,
          isAdmin: res.user.isAdmin,
        });

        // Redirect to dashboard
        navigate({ to: "/app/market" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Google authentication failed";
        console.error("Google callback error:", err);
        setErrorMsg(msg);
        // Redirect back to login with error query parameter
        navigate({
          to: "/login",
          search: {
            error: msg,
          } as any,
        });
      }
    };

    handleCallback();
  }, [navigate, loginWithToken]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-4">
        {errorMsg ? (
          <div className="text-red-400 font-medium">
            <p>Authentication Failed</p>
            <p className="text-sm mt-1 opacity-70">{errorMsg}</p>
            <p className="text-xs mt-4 text-white/40">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)] mx-auto" />
            <h2 className="text-lg font-semibold text-white">Verifying with Google...</h2>
            <p className="text-xs text-white/50">Please wait while we secure your session.</p>
          </>
        )}
      </div>
    </div>
  );
}
