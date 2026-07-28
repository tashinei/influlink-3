// ─────────────────────────────────────────────────────────────────────────────
// Brand subscription tiers + feature gating.
//
// The pricing-page brand tiers are platform SaaS subscriptions. This file is
// the FRONTEND half of the entitlement contract; the authoritative copy lives
// in server.js (BRAND_PLANS / BRAND_FEATURE_MIN_TIER). The server also returns
// its map from /api/billing/subscription, so useSubscription prefers the live
// values and treats these as the fallback / type source.
//
// ► Keep BRAND_TIER_RANK and BRAND_FEATURE_MIN_TIER in sync with server.js.
// ─────────────────────────────────────────────────────────────────────────────

export const BRAND_TIERS = ["essential", "starter", "growth", "pro", "enterprise"] as const;
export type BrandTier = (typeof BRAND_TIERS)[number];

/** Higher unlocks more. Mirrors BRAND_PLANS[tier].rank in server.js. */
export const BRAND_TIER_RANK: Record<BrandTier, number> = {
  essential: 1,
  starter: 2,
  growth: 3,
  pro: 4,
  enterprise: 5,
};

/** Tiers a brand can self-serve checkout for (enterprise is contact-sales). */
export const SUBSCRIBABLE_TIERS: BrandTier[] = ["essential", "starter", "growth", "pro"];

export type BillingInterval = "monthly" | "annual";

/** Feature key → minimum tier. Mirrors BRAND_FEATURE_MIN_TIER in server.js. */
export const BRAND_FEATURE_MIN_TIER: Record<string, BrandTier> = {
  "campaigns.create": "essential",
  "creators.search": "essential",
  "analytics.basic": "starter",
  "analytics.advanced": "growth",
  "team.seats": "growth",
  "campaigns.unlimited": "pro",
  "api.access": "pro",
  "support.priority": "pro",
};

export const rankOf = (tier?: string | null, ranks: Record<string, number> = BRAND_TIER_RANK) =>
  (tier && ranks[tier]) || 0;

/** Does `tier` clear the bar for `feature`? */
export const tierHasFeature = (
  tier: string | null | undefined,
  feature: string,
  featureMap: Record<string, string> = BRAND_FEATURE_MIN_TIER,
  ranks: Record<string, number> = BRAND_TIER_RANK
) => {
  const required = featureMap[feature];
  if (!required) return true; // ungated
  return rankOf(tier, ranks) >= rankOf(required, ranks);
};
