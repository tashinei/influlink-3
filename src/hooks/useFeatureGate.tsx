import { useCallback, useState } from "react";
import { BrandTier } from "@/config/brandPlans";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "@/hooks/useTranslation";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";

/**
 * Couples a tier check to the upgrade dialog. Gate an action like:
 *
 *   const gate = useFeatureGate();
 *   <button onClick={() => gate.ensure("analytics.advanced") && openAnalytics()}>…</button>
 *   {gate.dialog}
 *
 * `ensure` returns true when the brand is entitled; otherwise it opens the
 * upgrade dialog and returns false, so the caller simply short-circuits.
 *
 * It can also be driven by a backend 402 (`error: "upgrade_required"`) via
 * `openFor(requiredTier, feature)`, for actions gated server-side.
 */
export const useFeatureGate = () => {
  const { t } = useTranslation();
  const { hasFeature, startCheckout, busy, featureMap } = useSubscription();
  const [open, setOpen] = useState(false);
  const [requiredTier, setRequiredTier] = useState<BrandTier | null>(null);
  const [feature, setFeature] = useState<string | null>(null);

  // Optional per-feature label under `upgrade.features.<key>`; falls back to
  // undefined so the dialog uses its generic copy.
  const featureLabel = (() => {
    if (!feature) return undefined;
    const key = `upgrade.features.${feature}`;
    const label = t(key);
    return label === key ? undefined : label;
  })();

  const openFor = useCallback((tier: BrandTier | null, featureKey?: string) => {
    setRequiredTier(tier);
    setFeature(featureKey ?? null);
    setOpen(true);
  }, []);

  const ensure = useCallback(
    (featureKey: string): boolean => {
      if (hasFeature(featureKey)) return true;
      openFor((featureMap[featureKey] as BrandTier) ?? null, featureKey);
      return false;
    },
    [hasFeature, featureMap, openFor]
  );

  const dialog = (
    <UpgradeDialog
      open={open}
      onOpenChange={setOpen}
      requiredTier={requiredTier}
      featureLabel={featureLabel}
      onUpgrade={(tier) => startCheckout(tier)}
      busy={busy}
    />
  );

  return { ensure, openFor, dialog, isOpen: open };
};
