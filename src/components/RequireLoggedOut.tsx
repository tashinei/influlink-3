import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

/**
 * Blocks the login/registration pages for users who already have an active,
 * fully-registered session. Instead of rendering the auth form it shows a
 * blocking dialog offering to continue to their profile or log out.
 *
 * We gate on `isRegistered` (not just `user`): the Google onboarding flow sets
 * `user` before registration is finished, and blocking there would break it.
 */
const RequireLoggedOut = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const isRegistered = useUserStore((s) => s.isRegistered);
  const logout = useUserStore((s) => s.logout);

  const isLoggedIn = Boolean(user && isRegistered);

  if (!isLoggedIn) return <>{children}</>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary via-secondary to-[#6EC5E9]">
      <AlertDialog open>
        <AlertDialogContent
          className="rounded-3xl border-none"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              {t("authGuard.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("authGuard.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => logout()}
              className="rounded-full"
            >
              {t("authGuard.logout")}
            </Button>
            <Button
              onClick={() => navigate("/profile/me")}
              className="rounded-full bg-gradient-to-br from-primary to-secondary text-white hover:opacity-90"
            >
              {t("authGuard.goToProfile")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RequireLoggedOut;
