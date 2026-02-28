import { useState, useEffect, useCallback } from "react";
import { AnalyticsData } from "@/types/profile";
import { useProfile } from "./useProfile";
import { useUserStore } from "@/store/useUserStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is not set.");
}

export const useAnalytics = () => {
  const { profile } = useProfile();
  const { token } = useUserStore();

  const profileId = profile?.id ?? null;
  const isVIP = profile?.isVIP ?? false;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!profileId || !isVIP || !token) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/profiles/${profileId}/analytics`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Gracefully handle 404 (analytics not ready yet)
      if (response.status === 404) {
        setAnalytics(null);
        setError(null);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch analytics");
      }

      const data = await response.json();

      const sanitizedData: AnalyticsData = {
        ...data,
        avgEngagement: Number(data.avgEngagement || 0),
        totalViews: Number(data.totalViews || 0),
      };

      setAnalytics(sanitizedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics"
      );
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, isVIP, token]);

  // Fetch + Poll
  useEffect(() => {
    if (!profileId || !isVIP || !token) return;

    fetchAnalytics(); // initial fetch

    const interval = setInterval(fetchAnalytics, 60000); // 60s polling

    return () => clearInterval(interval);
  }, [profileId, isVIP, token, fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetchAnalytics: fetchAnalytics,
    isVIP,
  };
};