import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrandTier } from "@/config/brandPlans";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Shown when a brand attempts something above its plan ("nothing more"). It
 * names the tier that unlocks the action and offers a one-click upgrade
 * (Stripe Checkout) or a jump to the full pricing page.
 */
export function UpgradeDialog({
  open,
  onOpenChange,
  requiredTier,
  featureLabel,
  onUpgrade,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tier that unlocks the blocked action. */
  requiredTier: BrandTier | null;
  /** Human label for the blocked feature, already translated. */
  featureLabel?: string;
  /** Start checkout for `requiredTier`. If omitted, the dialog routes to /pricing. */
  onUpgrade?: (tier: BrandTier) => void;
  busy?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tierName = requiredTier ? t(`upgrade.tierNames.${requiredTier}`) : "";
  // Fall back to the raw tier key if a name isn't translated.
  const tierLabel = tierName && !tierName.startsWith("upgrade.") ? tierName : requiredTier || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary shadow-md">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t("upgrade.title")}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            {featureLabel
              ? t("upgrade.descFeature").replace("{{feature}}", featureLabel).replace("{{tier}}", tierLabel)
              : t("upgrade.desc").replace("{{tier}}", tierLabel)}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-col">
          {requiredTier && onUpgrade && (
            <Button
              onClick={() => onUpgrade(requiredTier)}
              disabled={busy}
              className="w-full gap-2 rounded-full bg-gradient-to-br from-secondary to-primary text-white shadow-md hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" />
              {busy ? t("upgrade.redirecting") : t("upgrade.cta").replace("{{tier}}", tierLabel)}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              navigate("/pricing");
            }}
            className="w-full rounded-full"
          >
            {t("upgrade.viewPlans")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
