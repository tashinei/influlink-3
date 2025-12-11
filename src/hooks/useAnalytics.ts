import { useState, useEffect, useCallback } from "react";
import { AnalyticsData } from "@/types/profile";
import { useProfile } from "./useProfile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is not set.");
}

export const useAnalytics = () => {
  const { profile } = useProfile();
  const profileId = profile?.id ?? null;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!profileId) return;

    if (!profile?.isVIP) {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/profiles/${profileId}/analytics`, {
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, profile?.isVIP]);

  // --- Polling ---
  useEffect(() => {
    fetchAnalytics(); // initial fetch

    if (!profile?.isVIP) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 60000); // every 10 seconds, adjust as needed

    return () => clearInterval(interval);
  }, [fetchAnalytics, profile?.isVIP]);

  return { analytics, isLoading, error, refetchAnalytics: fetchAnalytics, isVIP: profile?.isVIP ?? false };
};
