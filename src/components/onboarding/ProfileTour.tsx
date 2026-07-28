import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Guided coach-mark tour shown after the creator onboarding dialog closes.
 * It blurs and dims the whole page except for one highlighted target at a time,
 * and points to it with a title + description. Targets are located by CSS
 * selector (each button carries a `data-tour="…"` attribute); steps whose
 * target isn't currently visible are skipped automatically.
 *
 * Because the app renders separate mobile and desktop markup for the same
 * action (e.g. payouts), a selector may match several nodes — the first
 * *visible* one wins.
 */

export interface TourStep {
  selector: string;
  title: string;
  description: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

const PAD = 10; // spotlight padding around the target
const GAP = 14; // gap between target and tooltip
const EDGE = 12; // minimum distance from the viewport edge
const TIP_W = 300; // tooltip width (keep in sync with the class below)

/** First match that is actually rendered and visible on screen. */
const resolve = (selector: string): HTMLElement | null => {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return (
    nodes.find((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const cs = window.getComputedStyle(el);
      return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0;
    }) ?? null
  );
};

/**
 * The creator tour, in the order a creator meets these things on the page:
 * profile header → portfolio → analytics → the floating dock → payouts.
 * Steps are dropped at runtime when their target isn't on screen (Instagram
 * already linked, notifications hidden on desktop, …).
 */
export const buildProfileTourSteps = (t: (key: string) => string): TourStep[] => [
  {
    selector: '[data-tour="connect-instagram"]',
    title: t("tour.instagramTitle"),
    description: t("tour.instagramDesc"),
  },
  {
    selector: '[data-tour="add-work"]',
    title: t("tour.addWorkTitle"),
    description: t("tour.addWorkDesc"),
  },
  {
    selector: '[data-tour="plans"]',
    title: t("tour.plansTitle"),
    description: t("tour.plansDesc"),
  },
  {
    selector: '[data-tour="analytics-tab"]',
    title: t("tour.analyticsTitle"),
    description: t("tour.analyticsDesc"),
  },
  {
    selector: '[data-tour="dock-explore"]',
    title: t("tour.exploreTitle"),
    description: t("tour.exploreDesc"),
  },
  {
    selector: '[data-tour="dock-chat"]',
    title: t("tour.chatTitle"),
    description: t("tour.chatDesc"),
  },
  {
    selector: '[data-tour="dock-links"]',
    title: t("tour.linksTitle"),
    description: t("tour.linksDesc"),
  },
  // Payouts live in a full-width button on mobile and inside the "⋯" menu on
  // desktop — only one of the two is ever visible, so the other is skipped.
  {
    selector: '[data-tour="payouts"]',
    title: t("tour.payoutsTitle"),
    description: t("tour.payoutsDesc"),
  },
  {
    selector: '[data-tour="profile-menu"]',
    title: t("tour.menuTitle"),
    description: t("tour.menuDesc"),
  },
];

export function ProfileTour({
  open,
  steps,
  onClose,
}: {
  open: boolean;
  steps: TourStep[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState<TourStep[]>([]);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tipH, setTipH] = useState(0);
  const tipRef = useRef<HTMLDivElement | null>(null);

  // Keep the latest props in refs so the "build the step list" effect can stay
  // keyed on `open` alone — a parent re-render (new array identity, new
  // callback) must not restart the tour.
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Build the list of steps whose targets exist — only when the tour opens.
  useEffect(() => {
    if (!open) return;
    const present = stepsRef.current.filter((s) => resolve(s.selector));
    setActive(present);
    setIndex(0);
    setRect(null);
    if (present.length === 0) onCloseRef.current();
  }, [open]);

  const step = active[index];

  const finish = useCallback(() => {
    setIndex(0);
    setRect(null);
    onCloseRef.current();
  }, []);

  /** Drop a step whose target vanished while the tour was running. */
  const dropCurrent = useCallback(() => {
    const next = active.filter((_, i) => i !== index);
    if (next.length === 0) {
      finish();
      return;
    }
    setActive(next);
    setIndex(Math.min(index, next.length - 1));
  }, [active, index, finish]);

  const measure = useCallback(() => {
    if (!step) return;
    const el = resolve(step.selector);
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Never spotlight with sharp corners, even around a square target.
    const raw = parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    const radius = Number.isFinite(raw) ? Math.max(raw, 12) : 12;
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height, radius });
  }, [step]);

  useLayoutEffect(() => {
    if (!open || !step) return;
    const el = resolve(step.selector);
    if (!el) {
      dropCurrent();
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    measure();
    // Re-measure while the smooth scroll settles.
    const ids = [80, 200, 400].map((d) => window.setTimeout(measure, d));
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      ids.forEach(window.clearTimeout);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step, measure, dropCurrent]);

  // Measure the tooltip so it can flip above/below with its real height.
  useLayoutEffect(() => {
    const h = tipRef.current?.offsetHeight ?? 0;
    if (h && h !== tipH) setTipH(h);
  });

  const isFirst = index === 0;
  const isLast = index === active.length - 1;

  const next = useCallback(
    () => (isLast ? finish() : setIndex((i) => i + 1)),
    [isLast, finish]
  );
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish, next, back]);

  if (!open || !step || !rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const hole = {
    x: Math.max(rect.left - PAD, 0),
    y: Math.max(rect.top - PAD, 0),
    w: rect.width + PAD * 2,
    h: rect.height + PAD * 2,
  };

  // The cut-out follows the target's own corner radius (pill buttons stay
  // pills, square ones still get a soft corner). A rounded rect can't be
  // expressed as a gradient, so the mask's hole layer is an inline SVG sized
  // exactly to the hole.
  const holeR = Math.min(rect.radius + PAD, Math.min(hole.w, hole.h) / 2);
  const holeSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${hole.w}" height="${hole.h}">` +
    `<rect width="${hole.w}" height="${hole.h}" rx="${holeR}" ry="${holeR}" fill="black"/></svg>`;
  const holeMask = `url("data:image/svg+xml,${encodeURIComponent(holeSvg)}")`;

  // Prefer below the target; flip above when it doesn't fit (e.g. the bottom
  // dock), and fall back to whichever side has more room.
  const h = tipH || 170;
  const roomBelow = vh - (rect.top + rect.height) - GAP - EDGE;
  const roomAbove = rect.top - GAP - EDGE;
  const placeAbove = roomBelow < h && (roomAbove >= h || roomAbove > roomBelow);

  const half = Math.min(TIP_W, vw - EDGE * 2) / 2;
  const centerX = rect.left + rect.width / 2;
  const clampedX = Math.min(Math.max(centerX, half + EDGE), vw - half - EDGE);
  const rawY = placeAbove ? rect.top - GAP - h : rect.top + rect.height + GAP;
  const clampedY = Math.min(Math.max(rawY, EDGE), Math.max(vh - h - EDGE, EDGE));

  const tipStyle: React.CSSProperties = {
    top: clampedY,
    left: clampedX,
    transform: "translateX(-50%)",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[7000]"
      // Radix locks `pointer-events` on <body> while a dialog is open; the tour
      // follows one, so it opts back in rather than relying on that cleanup.
      style={{ pointerEvents: "auto" }}
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
    >
      {/* Blurred + dimmed overlay with a cut-out hole over the target */}
      <div
        className="absolute inset-0"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          WebkitMaskImage: `linear-gradient(#000 0 0), ${holeMask}`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: `0 0, ${hole.x}px ${hole.y}px`,
          WebkitMaskSize: `100% 100%, ${hole.w}px ${hole.h}px`,
          WebkitMaskComposite: "xor",
          maskImage: `linear-gradient(#000 0 0), ${holeMask}`,
          maskRepeat: "no-repeat",
          maskPosition: `0 0, ${hole.x}px ${hole.y}px`,
          maskSize: `100% 100%, ${hole.w}px ${hole.h}px`,
          maskComposite: "exclude",
        }}
      />

      {/* Highlight ring around the target */}
      <div
        className="pointer-events-none absolute ring-2 ring-white shadow-[0_0_0_5px_hsl(var(--primary)/0.5)] transition-all duration-300"
        style={{
          top: hole.y,
          left: hole.x,
          width: hole.w,
          height: hole.h,
          borderRadius: holeR,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tipRef}
        key={index}
        className="absolute w-[300px] max-w-[calc(100vw-24px)] rounded-2xl border bg-card p-5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        style={tipStyle}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">
            {index + 1} / {active.length}
          </span>
          <button
            type="button"
            onClick={finish}
            aria-label={t("tour.skip")}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-foreground">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("tour.skip")}
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={back}
                aria-label={t("tour.back")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <Button
              onClick={next}
              className="h-9 rounded-full bg-gradient-to-br from-secondary to-primary px-4 text-sm font-semibold text-white shadow-md hover:opacity-95"
            >
              {isLast ? t("tour.done") : t("tour.next")}
              {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
