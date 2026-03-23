import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const InstagramCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserStore();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("instagram.connecting") || "Connecting your account...");
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      setStatus("error");
      setMessage(t("instagram.error_denied") || "Access was denied or the link expired.");
      return;
    }

    if (!user) {
      setStatus("error");
      setMessage(t("instagram.error_session") || "Session expired. Please log in again.");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const performConnection = async () => {
      try {
        // STEP 1: Connect Account
        const connectRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/instagram/connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials:"include",
          body: JSON.stringify({ code }),
        });

        if (!connectRes.ok) throw new Error("Connection failed");

        // STEP 2: Initial Sync
        setMessage(t("instagram.syncing") || "Syncing your latest insights...");
        const syncRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/instagram/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials:"include"
        });

        if (!syncRes.ok) throw new Error("Sync failed");

        setStatus("success");
        setMessage(t("instagram.success") || "Account connected successfully!");
        
        // Short delay so user can see the success state
        setTimeout(() => navigate("/profile/me?status=linked"), 2000);

      } catch (err) {
        console.error("Instagram Auth Error:", err);
        setStatus("error");
        setMessage(t("instagram.error_generic") || "Something went wrong. Please try again.");
      }
    };

    performConnection();
  }, [searchParams, navigate, user, t]);

  return (
    <div className="flex flex-col items-center justify-center !h-[100dvh] space-y-6 bg-background p-4 text-center">
      <div className="relative flex items-center justify-center">
        {status === "loading" && (
          <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
            {status === "loading" && <div className="h-8 w-8 bg-primary rounded-full animate-pulse" />}
            {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in" />}
            {status === "error" && <AlertCircle className="h-16 w-16 text-destructive animate-in shake-2" />}
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-2xl font-bold tracking-tight">
          {status === "loading" ? t("instagram.please_wait") || "Please wait" : 
           status === "success" ? t("instagram.done") || "All set!" : 
           t("instagram.oops") || "Oops!"}
        </h2>
        <p className="text-muted-foreground font-medium">
          {message}
        </p>
      </div>

      {status === "error" && (
        <button 
          onClick={() => navigate("/profile/me")}
          className="text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t("instagram.back_to_profile") || "Back to profile"}
        </button>
      )}
    </div>
  );
};