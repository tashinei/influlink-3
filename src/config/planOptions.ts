// ─────────────────────────────────────────────────────────────────────────────
// Rate-card option catalogue.
//
// Every field a creator picks is constrained to these values so packages stay
// comparable across profiles. Labels live in i18n (`plans.platforms.*`,
// `plans.tiers.*`, `plans.deliverables.*`); this file only holds the keys.
//
// ► These lists are MIRRORED in server.js (PLAN_PLATFORMS / PLAN_TIERS /
//   PLAN_DELIVERABLES). The backend ships as a single hand-uploaded file and
//   can't import from src/, so any change here must be made there too.
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_PLATFORMS = ["instagram", "tiktok", "youtube", "x", "facebook"] as const;
export type PlanPlatform = (typeof PLAN_PLATFORMS)[number];

export const PLAN_TIERS = ["starter", "standard", "growth", "premium", "signature"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

/** What a creator can deliver, per platform. */
export const PLAN_DELIVERABLES: Record<PlanPlatform, readonly string[]> = {
  instagram: ["reel", "story", "post", "carousel", "live", "collab"],
  tiktok: ["video", "photo", "live", "spark"],
  youtube: ["video", "short", "integration", "community"],
  x: ["post", "thread", "video"],
  facebook: ["post", "reel", "story", "video"],
};

/** Turnaround options, in days. */
export const PLAN_DELIVERY_DAYS = [1, 2, 3, 5, 7, 10, 14, 21, 30] as const;

/** Quantity per deliverable line. */
export const PLAN_QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const MAX_PLANS = 6;
export const MAX_DELIVERABLES = 6;

/**
 * Label for an enum key. `t()` echoes the path back when a key is missing, so
 * fall through to the raw key rather than printing "plans.deliverables.foo" —
 * relevant for rows written before deliverables were structured.
 */
export const optionLabel = (t: (k: string) => string, group: string, key: string) => {
  const path = `plans.${group}.${key}`;
  const label = t(path);
  return label === path ? key : label;
};
