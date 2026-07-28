import { useCallback, useEffect, useState } from "react";
import { CreatorPlan } from "@/types/profile";

/**
 * Coerce whatever the API returned into a renderable plan. A backend running an
 * older build sends `features: string[]` instead of structured `deliverables`,
 * and the profile page must not blow up over it — an under-described package is
 * survivable, a crashed profile isn't.
 */
const normalizePlan = (raw: any): CreatorPlan => ({
  id: String(raw?.id ?? ""),
  platform: raw?.platform || "instagram",
  title: raw?.title || "starter",
  description: raw?.description || "",
  price: Number(raw?.price) || 0,
  currency: raw?.currency || "EUR",
  deliveryDays:
    raw?.deliveryDays === null || raw?.deliveryDays === undefined
      ? null
      : Number(raw.deliveryDays),
  deliverables: Array.isArray(raw?.deliverables)
    ? raw.deliverables
        .map((d: any) => {
          if (typeof d === "string") return d.trim() ? { type: d.trim(), qty: null } : null;
          if (d && typeof d === "object") {
            return { type: String(d.type), qty: d.qty === null ? null : Number(d.qty) || 1 };
          }
          return null;
        })
        .filter(Boolean)
    : [],
  isFeatured: Boolean(raw?.isFeatured),
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is not set.");
}

/**
 * What the editor sends back — the server assigns ids, ordering and currency.
 * `title` carries a tier key, not prose (see src/config/planOptions.ts).
 */
export type PlanDraft = Omit<CreatorPlan, "id" | "currency">;

/**
 * Reads a profile's rate card, and (for the owner) saves it back as a whole
 * list — the server replaces every plan in one transaction, so ordering and
 * deletions can't half-apply.
 */
export const useCreatorPlans = (profileId?: string) => {
  const [plans, setPlans] = useState<CreatorPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    if (!profileId) {
      setPlans([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/profiles/${profileId}/plans`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data.map(normalizePlan) : []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch plans");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  /** Resolves to an error message, or null when the save succeeded. */
  const savePlans = async (drafts: PlanDraft[]): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/profiles/me/plans`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plans: drafts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return data.message || "Failed to save plans";
      setPlans(Array.isArray(data.plans) ? data.plans.map(normalizePlan) : []);
      return null;
    } catch (err) {
      console.error("Failed to save plans:", err);
      return err instanceof Error ? err.message : "Failed to save plans";
    }
  };

  return { plans, isLoading, error, savePlans, refetch: fetchPlans };
};
