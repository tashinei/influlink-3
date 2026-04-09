// pages/PayoutsCallback.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export const PayoutsCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();
  const isSuccess = searchParams.get("status") === "success";

  useEffect(() => {
    if (isSuccess) {
      // Small delay to let the Stripe Webhook process in the background
      const timer = setTimeout(() => setStatus("success"), 2000);
      return () => clearTimeout(timer);
    } else {
      setStatus("error");
    }
  }, [isSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
          <h2 className="text-2xl font-bold">Verifying your account...</h2>
        </>
      )}

      {status === "success" && (
        <div className="animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2">Payouts Enabled!</h2>
          <p className="text-muted-foreground mb-6">Your Stripe Connect account is ready to receive payments.</p>
          <button 
            onClick={() => navigate("/profile/me")}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold"
          >
            Back to Profile
          </button>
        </div>
      )}

      {status === "error" && (
        <div>
          <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2">Onboarding Incomplete</h2>
          <p className="text-muted-foreground mb-6">We couldn't verify your payout details. Please try again.</p>
          <button 
            onClick={() => navigate("/profile/me")}
            className="border border-border px-8 py-3 rounded-full"
          >
            Return to Settings
          </button>
        </div>
      )}
    </div>
  );
};