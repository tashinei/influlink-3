import { Link } from "react-router-dom";
import { Briefcase, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Shown when a brand tries to register or use brand functionality while the
 * platform is in creator-only launch mode (see src/config/features.ts).
 */
export function BrandsComingSoonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Added !h-auto, h-fit, and max-h to override any global shadcn height defaults */}
      <DialogContent className="sm:max-w-sm !h-auto max-h-[85vh] overflow-y-auto bg-gradient-to-br from-primary via-primary to-secondary text-white border-white/10 sm:rounded-2xl z-[6000] p-12 py-14 my-auto">
        <DialogHeader className="space-y-1.5 text-center">
          <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 mb-1">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">{t("brandsClosed.title")}</DialogTitle>
          <DialogDescription className="text-white/80 text-xs sm:text-sm leading-normal">
            {t("brandsClosed.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            to="/register/creator"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            {t("brandsClosed.creatorCta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full py-2 px-4 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors"
          >
            {t("brandsClosed.close")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Full-page version, used when someone lands directly on a brand-only route. */
export function BrandsClosedNotice() {
  const { t } = useTranslation();

  return (
    /* Added h-fit, self-center, and my-auto to prevent flex parents from stretching the container */
    <div className="w-full h-fit min-h-[50vh] flex items-center justify-center px-4 py-8 my-auto self-center">
      {/* Added h-fit and !h-auto to strictly lock card height to its contents */}
      <div className="max-w-md w-full !h-auto h-fit text-center rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-secondary to-primary text-white shadow-xl">
        <div className="mx-auto mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{t("brandsClosed.title")}</h1>
        <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-6">{t("brandsClosed.description")}</p>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            to="/register/creator"
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            {t("brandsClosed.creatorCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/contact"
            className="flex items-center justify-center px-5 py-2 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/25 hover:bg-white/20 transition-colors"
          >
            {t("brandsClosed.contactCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}