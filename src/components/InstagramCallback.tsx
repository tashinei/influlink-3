import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const InstagramCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [debugMsg, setDebugMsg] = useState("Initializing...");
  const hasCalled = useRef(false);
  const { token } = useUserStore();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setDebugMsg("No code found in URL.");
      return;
    }

    if (!token) {
      setDebugMsg("User session not found. Please log in again.");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const syncAnalytics = async () => {
      try {
        setDebugMsg("Syncing Instagram analytics...");

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/instagram/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📥 IG Sync Response:", data);

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to sync analytics");
        }

        setDebugMsg("Analytics synced! Redirecting...");
        setTimeout(() => navigate("/profile/me?status=success"), 1000);

      } catch (err: any) {
        console.error("💥 IG Callback Error:", err);
        setDebugMsg(`Error: ${err.message}`);
      }
    };

    syncAnalytics();
  }, [searchParams, navigate, token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <h2 className="text-xl font-semibold">{debugMsg}</h2>
      <p className="text-muted-foreground text-sm">Check browser console (F12) for logs.</p>
    </div>
  );
};