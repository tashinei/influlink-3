import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Hand,
  Instagram,
  Search,
  Briefcase,
  Images,
  Plus,
  MessageCircle,
  Link as LinkIcon,
  Bell,
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Heart,
  Users,
  TrendingUp,
} from "lucide-react";

/**
 * First-run onboarding for creators. Shown once when a newly registered creator
 * lands on their profile (see Profile.tsx). Each step pairs a component-composed
 * illustration (built from the app's own UI primitives) with a short explanation
 * of what the creator can do and where. Navigation is a stepper with arrows.
 */

// ── Illustrations ────────────────────────────────────────────────────────────
// Small on-brand mockups assembled from the same primitives the real screens use.

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex h-[236px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 p-5">
    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-secondary/10 blur-2xl" />
    <div className="relative w-full">{children}</div>
  </div>
);

const StatTile = ({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) => (
  <div className="flex flex-col items-center gap-1 rounded-xl border bg-card px-2 py-2.5 shadow-sm">
    <Icon className="h-4 w-4 text-primary" />
    <span className="text-sm font-bold leading-none text-foreground">{value}</span>
    <span className="text-[10px] leading-none text-muted-foreground">{label}</span>
  </div>
);

const WelcomeChip = ({ icon: Icon, className }: { icon: React.ElementType; className: string }) => (
  <div
    className={cn(
      "absolute flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1.5 shadow-lg backdrop-blur-md",
      className
    )}
  >
    <Icon className="h-3.5 w-3.5 text-white" />
    <div className="h-1.5 w-7 rounded-full bg-white/70" />
  </div>
);

const WelcomeIllustration = () => (
  <div className="relative flex h-[236px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary">
    {/* Depth: concentric rings + soft glows */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.18]" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-tertiary/50 blur-3xl" />
    </div>

    {/* Floating glass chips: creators · brands · growth */}
    <WelcomeChip icon={Users} className="left-4 top-6" />
    <WelcomeChip icon={Briefcase} className="right-4 top-10" />
    <WelcomeChip icon={TrendingUp} className="bottom-7 right-9" />

    {/* Center: brand logo in a glass tile */}
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div className="flex items-center justify-center rounded-2xl border border-white/25 bg-white/15 px-7 py-5 shadow-xl backdrop-blur-md">
        <img
          src="/influLink3.png"
          alt="InfluLink"
          className="h-auto w-[132px] object-contain drop-shadow"
        />
      </div>
      <div className="h-2 w-24 rounded-full bg-white/45" />
    </div>
  </div>
);

const ProfileIllustration = ({ connectLabel }: { connectLabel: string }) => (
  <Frame>
    <div className="mx-auto w-full max-w-[260px] rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary shadow-sm" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-2.5 w-28 rounded-full bg-foreground/80" />
          <div className="h-2 w-16 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary py-2 text-[11px] font-semibold text-white shadow-sm">
        <Instagram className="h-3.5 w-3.5" />
        {connectLabel}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatTile icon={Users} value="12.4k" label="Followers" />
        <StatTile icon={Heart} value="4.8%" label="Engage" />
        <StatTile icon={BarChart3} value="89k" label="Reach" />
      </div>
    </div>
  </Frame>
);

const CampaignsIllustration = ({ applyLabel }: { applyLabel: string }) => (
  <Frame>
    <div className="mx-auto w-full max-w-[280px]">
      <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <div className="h-2 w-28 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="mt-3 space-y-2">
        {[
          { g: "from-primary to-secondary", budget: "€500" },
          { g: "from-secondary to-tertiary", budget: "€1.2k" },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 shadow-sm">
            <div className={cn("h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br", c.g)} />
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-24 rounded-full bg-foreground/70" />
              <div className="mt-1.5 flex gap-1">
                <Badge variant="secondary" className="text-[9px]">Fashion</Badge>
                <Badge className="text-[9px]">{c.budget}</Badge>
              </div>
            </div>
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
              {applyLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);

const PortfolioIllustration = ({ addLabel }: { addLabel: string }) => (
  <Frame>
    <div className="mx-auto grid w-full max-w-[260px] grid-cols-3 gap-2">
      {[
        "from-primary to-secondary",
        "from-secondary to-tertiary",
        "from-tertiary to-primary",
        "from-primary/80 to-tertiary/80",
        "from-secondary/80 to-primary/80",
      ].map((g, i) => (
        <div key={i} className={cn("aspect-square rounded-xl bg-gradient-to-br shadow-sm", g)} />
      ))}
      <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 text-primary">
        <Plus className="h-5 w-5" />
        <span className="text-[9px] font-semibold">{addLabel}</span>
      </div>
    </div>
  </Frame>
);

const DockButton = ({ icon: Icon, badge }: { icon: React.ElementType; badge?: boolean }) => (
  <div className="relative flex h-8 w-8 items-center justify-center text-white">
    <Icon className="h-5 w-5" />
    {badge && (
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-primary bg-white" />
    )}
  </div>
);

const ChatIllustration = () => (
  <Frame>
    <div className="mx-auto w-full max-w-[280px]">
      <div className="space-y-2">
        <div className="ml-auto w-[70%] rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-secondary px-3 py-2.5 shadow-sm">
          <div className="h-2 w-full rounded-full bg-white/75" />
          <div className="mt-1.5 h-2 w-3/5 rounded-full bg-white/50" />
        </div>
        <div className="w-[70%] rounded-2xl rounded-bl-sm border bg-card px-3 py-2.5 shadow-sm">
          <div className="h-2 w-full rounded-full bg-muted-foreground/30" />
          <div className="mt-1.5 h-2 w-2/3 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
      <div className="relative mx-auto mt-4 flex w-fit items-center justify-center overflow-hidden rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-xl">
        {/* Same treatment as the real floating dock: primary gradient + white icons */}
        <div className="absolute inset-0 border-2 border-primary/30 bg-gradient-to-r from-primary/80 via-primary/50 to-primary opacity-90" />
        <div className="relative z-10 flex items-center gap-4">
          <DockButton icon={MessageCircle} />
          <DockButton icon={Briefcase} />
          <DockButton icon={LinkIcon} />
          <DockButton icon={Bell} badge />
        </div>
      </div>
    </div>
  </Frame>
);

const PayoutIllustration = ({ setupLabel, dealLabel, commissionLabel, receiveLabel }: {
  setupLabel: string; dealLabel: string; commissionLabel: string; receiveLabel: string;
}) => (
  <Frame>
    <div className="mx-auto w-full max-w-[260px] rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{dealLabel}</span>
        <span className="font-semibold text-foreground">€500</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{commissionLabel}</span>
        <span className="font-semibold text-foreground">−€50 (10%)</span>
      </div>
      <div className="my-2.5 border-t" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{receiveLabel}</span>
        <span className="text-base font-bold text-primary">€450</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-secondary to-primary py-2 text-[11px] font-semibold text-white shadow-sm">
        <CreditCard className="h-3.5 w-3.5" />
        {setupLabel}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3" />
        15% → 7%
      </div>
    </div>
  </Frame>
);

// ── Dialog ───────────────────────────────────────────────────────────────────

interface CreatorOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Fired only when the creator reaches the end and presses "Get started" —
   * skipping or closing the dialog does not call it. Profile.tsx uses this to
   * start the coach-mark tour.
   */
  onFinish?: () => void;
}

export function CreatorOnboardingDialog({
  open,
  onOpenChange,
  onFinish,
}: CreatorOnboardingDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Hand,
      title: t("onboarding.welcomeTitle"),
      description: t("onboarding.welcomeDesc"),
      illustration: <WelcomeIllustration />,
    },
    {
      icon: Instagram,
      title: t("onboarding.profileTitle"),
      description: t("onboarding.profileDesc"),
      illustration: <ProfileIllustration connectLabel={t("onboarding.connectInstagram")} />,
    },
    {
      icon: Search,
      title: t("onboarding.campaignsTitle"),
      description: t("onboarding.campaignsDesc"),
      illustration: <CampaignsIllustration applyLabel={t("onboarding.apply")} />,
    },
    {
      icon: Images,
      title: t("onboarding.portfolioTitle"),
      description: t("onboarding.portfolioDesc"),
      illustration: <PortfolioIllustration addLabel={t("onboarding.addWork")} />,
    },
    {
      icon: MessageCircle,
      title: t("onboarding.chatTitle"),
      description: t("onboarding.chatDesc"),
      illustration: <ChatIllustration />,
    },
    {
      icon: CreditCard,
      title: t("onboarding.payoutsTitle"),
      description: t("onboarding.payoutsDesc"),
      illustration: (
        <PayoutIllustration
          setupLabel={t("onboarding.setupPayouts")}
          dealLabel={t("onboarding.deal")}
          commissionLabel={t("onboarding.commission")}
          receiveLabel={t("onboarding.youReceive")}
        />
      ),
    },
  ];

  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const current = steps[step];
  const StepIcon = current.icon;

  const close = () => {
    onOpenChange(false);
    setStep(0);
  };

  const handleFinish = () => {
    close();
    onFinish?.();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg h-auto md:h-auto 2xl:h-auto max-h-[94dvh] [&>button]:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
              <StepIcon className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {t("onboarding.step")} {step + 1} / {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("onboarding.skip")}
          </button>
        </div>

        {/* Illustration */}
        <div className="px-10 pt-5" key={step}>
          <div className="animate-in fade-in-0 zoom-in-95 duration-300">{current.illustration}</div>
        </div>

        {/* Copy */}
        <DialogHeader className="space-y-2 px-10 pt-5 text-center sm:text-center">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {current.title}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-muted-foreground">
            {current.description}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper + arrows */}
        <div className="flex items-center justify-between gap-3 px-10 pb-8 pt-7">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
            aria-label={t("onboarding.back")}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
              isFirst
                ? "cursor-not-allowed border-transparent text-muted-foreground/30"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                aria-label={`${t("onboarding.step")} ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                )}
              />
            ))}
          </div>

          {isLast ? (
            <Button
              onClick={handleFinish}
              className="h-11 rounded-full bg-gradient-to-br from-secondary to-primary px-5 text-sm font-semibold text-white shadow-md hover:opacity-95"
            >
              {t("onboarding.getStarted")}
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              aria-label={t("onboarding.next")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-white shadow-md transition-transform hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
