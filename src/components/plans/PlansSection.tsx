import { Check, Clock, MessageCircle, Pencil, Plus, Sparkles, Tag } from "lucide-react";
import { BsInstagram, BsTiktok, BsYoutube, BsTwitterX, BsFacebook } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { NOISE_PATTERN } from "@/components/ui/pricing-glass";
import { optionLabel } from "@/config/planOptions";
import { cn } from "@/lib/utils";
import { CreatorPlan } from "@/types/profile";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * A creator's rate card, shown directly on the profile page (not behind a tab —
 * it's a conversion surface, so it shouldn't cost a click to find).
 *
 * One card per package, grouped two-up so they stay readable rather than
 * stretching the full width. Each card carries its platform, the deliverables,
 * and a price + "message now" rail on the right. Nothing here is payable; the
 * CTA opens a conversation.
 */

/**
 * Brand marks per platform — keys come from PLAN_PLATFORMS. The chips sit on
 * the gradient, so they're white glass rather than brand colours (a pink
 * Instagram chip is unreadable on the purple wash).
 */
const PLATFORM_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: BsInstagram,
  tiktok: BsTiktok,
  youtube: BsYoutube,
  x: BsTwitterX,
  facebook: BsFacebook,
};

const formatPrice = (price: number, currency: string) => {
  const symbol = currency === "EUR" ? "€" : `${currency} `;
  // Whole prices read better without trailing zeros: €300, not €300.00.
  const amount = Number.isInteger(price)
    ? price.toLocaleString()
    : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${amount}`;
};

const PlanCard = ({
  plan,
  isOwner,
  onContact,
}: {
  plan: CreatorPlan;
  isOwner: boolean;
  onContact?: () => void;
}) => {
  const { t } = useTranslation();
  const PlatformIcon = PLATFORM_ICON[plan.platform] ?? PLATFORM_ICON.instagram;
  // Defensive: a backend on an older build sends no `deliverables` at all.
  const deliverables = Array.isArray(plan.deliverables) ? plan.deliverables : [];

  return (
    <div
      className={cn(
        // Same gradient surface as the pricing page cards (pricing-glass.tsx).
        // Stacks below `sm` so the price rail doesn't crush the offer column.
        "group relative flex flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-secondary to-primary sm:flex-row",
        "transition-transform duration-300 hover:-translate-y-1",
        plan.isFeatured
          ? "border border-white/40 shadow-[0_32px_64px_-12px_hsl(var(--primary)/0.5),0_0_60px_hsl(var(--primary)/0.25)]"
          : "border border-white/15 shadow-[0_24px_48px_-16px_hsl(var(--primary)/0.35)]"
      )}
    >
      {/* Film grain, matching the pricing cards. */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: NOISE_PATTERN }}
      />

      {/* Offer */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <PlatformIcon className="h-3.5 w-3.5" />
            {optionLabel(t, "platforms", plan.platform)}
          </span>
          {plan.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <Sparkles className="h-3 w-3" />
              {t("plans.popular")}
            </span>
          )}
        </div>

        <h3 className="mt-3.5 text-2xl font-bold tracking-tight text-white">
          {optionLabel(t, "tiers", plan.title)}
        </h3>

        {plan.description && (
          <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-white/80">
            {plan.description}
          </p>
        )}

        {deliverables.length > 0 && (
          <>
            <div className="my-5 h-px w-full bg-white/25" />
            <ul className="space-y-3">
              {deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-base text-white/90">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="font-medium leading-tight">
                    {/* Legacy free-text lines carry no quantity. */}
                    {item.qty !== null && <span className="font-bold">{item.qty}× </span>}
                    {optionLabel(t, "deliverables", item.type)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Price + CTA rail */}
      <div className="relative z-10 flex shrink-0 flex-col items-center justify-center gap-4 border-t border-white/20 bg-white/[0.07] p-5 text-center sm:w-[168px] sm:border-l sm:border-t-0">
        <div>
          <div className="text-4xl font-bold leading-none tracking-tight text-white">
            {formatPrice(plan.price, plan.currency)}
          </div>
          {plan.deliveryDays !== null && (
            <div className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-white/70">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {t("plans.inDays").replace("{{days}}", String(plan.deliveryDays))}
            </div>
          )}
        </div>

        {!isOwner && onContact && (
          <Button
            onClick={onContact}
            className="w-full gap-1.5 rounded-[14px] bg-white px-3 py-3 text-sm font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-white/90"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            {t("plans.messageNow")}
          </Button>
        )}
      </div>
    </div>
  );
};

export function PlansSection({
  plans,
  isLoading,
  isOwner,
  onEdit,
  onContact,
}: {
  plans: CreatorPlan[];
  isLoading: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onContact?: () => void;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  // Visitors never see an empty shell — the parent hides the whole section.
  if (plans.length === 0) {
    if (!isOwner) return null;
    return (
      <div
        data-tour="plans"
        className="relative overflow-hidden rounded-2xl border border-dashed bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.04] px-6 py-12 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Tag className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{t("plans.emptyTitle")}</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("plans.emptyDesc")}
        </p>
        <Button
          onClick={onEdit}
          className="mt-5 gap-2 rounded-full bg-gradient-to-br from-secondary to-primary px-5 text-white shadow-md hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          {t("plans.addFirst")}
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div data-tour="plans" className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{t("plans.title")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isOwner ? t("plans.subtitleOwner") : t("plans.subtitleVisitor")}
          </p>
        </div>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="shrink-0 gap-2 rounded-full"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("plans.edit")}</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} isOwner={isOwner} onContact={onContact} />
        ))}
      </div>

      {!isOwner && <p className="text-xs text-muted-foreground">{t("plans.disclaimer")}</p>}
    </section>
  );
}
