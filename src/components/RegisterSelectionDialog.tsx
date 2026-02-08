import React from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, Briefcase, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface RegisterSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AccountOption {
  type: "creator" | "brand";
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  features: string[];
}

export default function RegisterSelectionDialog({
  open,
  onOpenChange,
}: RegisterSelectionDialogProps) {
  const handleOptionClick = () => {
    onOpenChange(false);
  };

  const { t } = useTranslation();

  const accountOptions: AccountOption[] = [
    {
      type: "creator",
      title: t("mvpNotifications.creator"),
      description: t("joinDialog.creatorDesc"),
      icon: User,
      href: "/register/creator",
      features: [t("joinDialog.findCampaigns"), t("joinDialog.setYourRates"), t("joinDialog.getPaidDirectly")],
    },
    {
      type: "brand",
      title: t("mvpNotifications.brand"),
      description: t("joinDialog.brandDesc"),
      icon: Briefcase,
      href: "/register/brand",
      features: [t("joinDialog.postCampaigns"), t("joinDialog.findCreators"), t("joinDialog.trackPerformance")],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-fit p-10 md:h-full sm:h-auto max-h-fit sm:max-w-2xl overflow-y-auto bg-gradient-to-br from-primary via-primary to-secondary shadow-2xl sm:rounded-3xl text-white">

        {/* Decorative background elements - hidden on extra small screens for performance */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50 sm:opacity-100">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 py-4 pt-10 pr-8 pl-8 pb-8 w-full">
          <DialogHeader className="space-y-2 sm:space-y-3 text-center">
            <DialogTitle className="text-2xl sm:text-4xl font-bold tracking-tight text-primary-foreground">
              {t("joinDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-[17px] text-primary-foreground/70">
              {t("joinDialog.selectTypeToStart")}
            </DialogDescription>
          </DialogHeader>

          {/* Optimization: Reduced gap for mobile, 
              ensured cards take full width but maintain spacing 
          */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {accountOptions.map((option) => (
              <AccountOptionCard
                key={option.type}
                option={option}
                onClick={handleOptionClick}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-100">
            {t("joinDialog.alreadyAccount")}{" "}
            <Link
              to="/login"
              onClick={handleOptionClick}
              className="font-medium text-white underline underline-offset-4 transition-colors hover:text-primary-foreground hover:underline"
            >
              {t("joinDialog.signIn")}
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccountOptionCard({ option, onClick }: { option: AccountOption; onClick: () => void }) {
  const Icon = option.icon;

  const { t } = useTranslation();

  return (
    <Link
      to={option.href}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-2xl bg-white/10 backdrop-blur-md p-5 sm:p-6 border border-white/10",
        "transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02]",
        "hover:bg-white/15 shadow-xl shadow-black/5"
      )}
    >
      <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
        {/* Icon: Smaller on mobile to save vertical space */}
        <div className="mb-0 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            {option.title}
          </h3>
          <p className="text-xs sm:text-sm leading-tight text-white/80 sm:mt-1">
            {option.description}
          </p>
        </div>
      </div>

      {/* Features list: Hidden on very small screens to keep UI clean, or kept with tighter spacing */}
      <ul className="my-4 hidden sm:block flex-1 space-y-2">
        {option.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-200">
            <div className="h-1 w-1 rounded-full bg-primary-foreground/40" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t border-primary-foreground/10 pt-4">
        <span className="text-xs sm:text-sm font-medium text-primary-foreground/80">
          {t("joinDialog.getStarted")}
        </span>
        <ArrowRight className="h-4 w-4 text-white opacity-70 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}