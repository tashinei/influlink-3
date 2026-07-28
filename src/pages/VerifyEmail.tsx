import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, AlertCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Landing page the email-verification link points to
 * (`/email-verification?token=…`). It POSTs the token to the API to confirm, then
 * shows success (→ log in) or an error with a resend form. The store is
 * localStorage-backed, so we send the user to log in normally after verifying.
 */
const VerifyEmail = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const token = params.get("token");
  const [status, setStatus] = useState<string>(
    token ? "loading" : params.get("status") || "invalid"
  );

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Confirm the token against the API.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!cancelled) setStatus(data.status || "error");
      } catch (err) {
        console.error("Verify request failed:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, API_BASE_URL]);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    try {
      await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Resend verification failed:", err);
    } finally {
      setSent(true);
      setSending(false);
    }
  };

  const isLoading = status === "loading";
  const success = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-gradient-to-br from-secondary via-tertiary to-primary">
      <Helmet>
        <title>{t("verifyEmail.pageTitle")} | InfluLink</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-8 md:p-10 text-center">
        {isLoading ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("verifyEmail.verifyingTitle")}</h1>
            <p className="text-slate-600 leading-relaxed">{t("verifyEmail.verifyingText")}</p>
          </>
        ) : success ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary">
              <CheckCircle2 className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("verifyEmail.successTitle")}</h1>
            <p className="text-slate-600 leading-relaxed mb-8">{t("verifyEmail.successText")}</p>
            <Button
              onClick={() => navigate("/register/creator?mode=login")}
              className="w-full rounded-full bg-gradient-to-br from-secondary to-primary text-white h-11"
            >
              {t("verifyEmail.goToLogin")}
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary">
              <AlertCircle className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {status === "expired" ? t("verifyEmail.expiredTitle") : t("verifyEmail.invalidTitle")}
            </h1>
            <p className="text-slate-600 leading-relaxed mb-6">
              {status === "expired" ? t("verifyEmail.expiredText") : t("verifyEmail.invalidText")}
            </p>

            {sent ? (
              <p className="flex items-center justify-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> {t("verifyEmail.resent")}
              </p>
            ) : (
              <div className="space-y-3 text-left">
                <label className="text-xs font-semibold text-slate-500">{t("verifyEmail.resendLabel")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("mvpLogin.email")}
                    className="pl-9 h-11"
                  />
                </div>
                <Button
                  onClick={resend}
                  disabled={sending || !email}
                  className="w-full rounded-full bg-gradient-to-br from-secondary to-primary text-white h-11"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("verifyEmail.resend")}
                </Button>
              </div>
            )}

            <Link
              to="/register/creator?mode=login"
              className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
            >
              {t("verifyEmail.backToLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
