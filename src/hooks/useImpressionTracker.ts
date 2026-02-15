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
  const token = useUserStore((state) => state.token); // 1. Вземи токена от стора

  useEffect(() => {
    // 2. Добави проверка за токен и валидни ID-та
    if (
      !ref.current ||
      !userId ||
      !campaignId ||
      !token || // Задължително провери за токен
      sessionTrackedCampaigns.has(campaignId)
    ) return;

    const trackImpression = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/${userId}/campaigns/${campaignId}/impression`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
      } catch (e) {
        console.error("Failed to track impression", e);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sessionTrackedCampaigns.has(campaignId)) {
          sessionTrackedCampaigns.add(campaignId);
          trackImpression();

          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [campaignId, userId, token]);

  return ref;
};