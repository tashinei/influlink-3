import { useCallback, useEffect, useState } from "react";
import {
  BillingInterval,
  BRAND_FEATURE_MIN_TIER,
  BRAND_TIER_RANK,
  BrandTier,
  tierHasFeature,
} from "@/config/brandPlans";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is not set.");
}

interface SubscriptionState {
  tier: BrandTier | null;
  status: string | null;
  isActive: boolean;
  /** past_due but still inside the grace window — access continues, warn them. */
  paymentIssue: boolean;
  interval: BillingInterval | null;
  currentPeriodEnd: string | null;
  graceUntil: string | null;
  cancelAtPeriodEnd: boolean;
}

const EMPTY: SubscriptionState = {
  tier: null,
  status: null,
  isActive: false,
  paymentIssue: false,
  interval: null,
  currentPeriodEnd: null,
  graceUntil: null,
  cancelAtPeriodEnd: false,
};

/**
 * The signed-in brand's subscription plus feature gating. Reads the live
 * entitlement map from the server (falling back to the bundled config), so
 * `hasFeature` reflects production rules even if the frontend build lags.
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionState>(EMPTY);
  const [featureMap, setFeatureMap] = useState<Record<string, string>>(BRAND_FEATURE_MIN_TIER);
  const [ranks, setRanks] = useState<Record<string, number>>(BRAND_TIER_RANK);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/billing/subscription`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load subscription");
      const data = await res.json();
      setSubscription({ ...EMPTY, ...(data.subscription || {}) });
      if (data.features) setFeatureMap(data.features);
      if (data.ranks) setRanks(data.ranks);
    } catch (err) {
      console.error("Error loading subscription:", err);
      setSubscription(EMPTY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const hasFeature = useCallback(
    (feature: string) => tierHasFeature(subscription.tier, feature, featureMap, ranks),
    [subscription.tier, featureMap, ranks]
  );

  /** Send the brand to Stripe Checkout. Resolves to an error string or null. */
  const startCheckout = useCallback(
    async (tier: BrandTier, interval: BillingInterval = "monthly"): Promise<string | null> => {
      try {
        setBusy(true);
        const res = await fetch(`${API_BASE_URL}/billing/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tier, interval }),
        });
        const data = await res.json().catch(() => ({}));
        // Server enforces one plan per account: if a subscription already
        // exists (stale client view), it says so — the caller should change
        // the plan instead of opening a second checkout.
        if (res.status === 409 && data.shouldChangePlan) return "__change_plan__";
        if (!res.ok || !data.url) return data.message || "Could not start checkout";
        window.location.href = data.url;
        return null;
      } catch (err) {
        console.error("Checkout failed:", err);
        return "Could not start checkout";
      } finally {
        setBusy(false);
      }
    },
    []
  );

  /**
   * Switch an existing subscription to another tier/interval with proration
   * (no redirect). Resolves to an error string, or null on success — the caller
   * should refetch. If there's no live subscription, resolves to the sentinel
   * "__checkout__" so the caller can fall back to checkout instead.
   */
  const changePlan = useCallback(
    async (tier: BrandTier, interval: BillingInterval = "monthly"): Promise<string | null> => {
      try {
        setBusy(true);
        const res = await fetch(`${API_BASE_URL}/billing/change-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tier, interval }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && data.shouldCheckout) return "__checkout__";
        if (!res.ok) return data.message || "Could not change plan";
        await fetchSubscription();
        return null;
      } catch (err) {
        console.error("Change plan failed:", err);
        return "Could not change plan";
      } finally {
        setBusy(false);
      }
    },
    [fetchSubscription]
  );

  /** Open the Stripe billing portal (manage/cancel). */
  const openPortal = useCallback(async (): Promise<string | null> => {
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE_URL}/billing/portal`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) return data.message || "Could not open billing portal";
      window.location.href = data.url;
      return null;
    } catch (err) {
      console.error("Portal failed:", err);
      return "Could not open billing portal";
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    subscription,
    isLoading,
    busy,
    hasFeature,
    ranks,
    featureMap,
    startCheckout,
    changePlan,
    openPortal,
    refetch: fetchSubscription,
  };
};
