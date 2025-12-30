import { useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";

interface UseImpressionTrackerProps {
  campaignId: number;
}

// 1. MOVE THIS OUTSIDE: This persists for the entire session
// It won't be reset when the component re-renders or remounts (Strict Mode)
const sessionTrackedCampaigns = new Set<number>();

export const useImpressionTracker = ({ campaignId }: UseImpressionTrackerProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const userId = useUserStore((state) => state.user?.id);

  useEffect(() => {
    // 2. Early exit if already tracked in this browser session
    if (!ref.current || !userId || sessionTrackedCampaigns.has(campaignId)) return;

    const trackImpression = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/${userId}/campaigns/${campaignId}/impression`,
          {
            method: "POST",
            credentials: "include",
          }
        );
      } catch (e) {
        console.error("Failed to track impression", e);
        // Optional: remove from set if you want to retry on failure
        // sessionTrackedCampaigns.delete(campaignId); 
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sessionTrackedCampaigns.has(campaignId)) {
          // 3. Mark as tracked immediately BEFORE the async call
          sessionTrackedCampaigns.add(campaignId);
          trackImpression();
          
          // 4. Optimization: Stop watching this element once tracked
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [campaignId, userId]);

  return ref;
};