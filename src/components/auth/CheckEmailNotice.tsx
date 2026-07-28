import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Shown after a hard-gated registration (or a login blocked for being
 * unverified): tells the user to check their inbox and lets them resend the
 * verification link. Styled for the dark register-page background (white text).
 */
export function CheckEmailNotice({
  email,
  onBackToLogin,
}: {
  email: string;
  onBackToLogin?: () => void;
}) {
  const { t } = useTranslation();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const resend = async () => {
    setSending(true);
    try {
      await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Resend verification failed:", err);
    } finally {
      // Generic success either way — the endpoint never reveals whether the
      // address exists, so the UI shouldn't either.
      setSent(true);
      setSending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 text-center text-white">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
        <Mail className="h-8 w-8 text-white" />
      </div>
      <h2 className="mb-2 text-3xl font-bold">{t("verifyEmail.checkTitle")}</h2>
      <p className="leading-relaxed text-white/80">{t("verifyEmail.checkText")}</p>
      <p className="mb-6 mt-1 break-all font-semibold">{email}</p>

      <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80">
        {t("verifyEmail.checkHint")}
      </div>

      {sent ? (
        <p className="flex items-center justify-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> {t("verifyEmail.resent")}
        </p>
      ) : (
        <Button
          onClick={resend}
          disabled={sending}
          className="rounded-full bg-gradient-to-br from-secondary to-primary px-6 text-white"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("verifyEmail.resend")}
        </Button>
      )}

      {onBackToLogin && (
        <button
          type="button"
          onClick={onBackToLogin}
          className="mx-auto mt-6 block text-sm text-white/70 underline transition-colors hover:text-white"
        >
          {t("verifyEmail.backToLogin")}
        </button>
      )}
    </div>
  );
}
