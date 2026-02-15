import { useState, useEffect, useCallback } from "react";
import { ProfileData } from "@/types/profile";
import { useUserStore } from "@/store/useUserStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is not set.");
}

export const useProfile = (profileIdentifier?: string) => {
  const user = useUserStore(state => state.user);
  const currentUserId = user?.id ?? null;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const identifierToFetch = profileIdentifier || currentUserId;

  const targetProfileId = profile?.id ?? null;

  const formatNumberShort = (num: number | string) => {
    const n = Number(num) || 0;

    // Numbers below 1,000 are returned as-is (e.g., 999)
    if (n < 1000) {
      return n.toString();
    }

    // Thousands (K)
    if (n >= 1000 && n < 1000000) {
      // Divide by 1000 and round to 1 decimal place if needed
      const val = n / 1000;
      return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'K';
    }

    // Millions (M)
    if (n >= 1000000) {
      // Divide by 1,000,000 and round to 1 decimal place
      const val = n / 1000000;
      return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
    }
    return n.toString();
  };

  const { token } = useUserStore();

  const fetchProfile = useCallback(async (identifier: string) => {
    if (!identifier) return;

    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/profiles/${identifier}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data);
      setError(null);
      setIsFollowing(data.isFollowing ?? false);

    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (identifierToFetch) {
      fetchProfile(identifierToFetch.toString());
    }
  }, [identifierToFetch, fetchProfile]);


  const toggleFollow = async () => {
    if (!targetProfileId || !currentUserId) {
      console.warn("Cannot toggle follow: Missing target profile ID or current user ID.");
      return;
    }

    if (targetProfileId === currentUserId) return;

    try {
      setIsFollowing(prev => !prev);

      const res = await fetch(`${API_BASE_URL}/profiles/${targetProfileId}/follow`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`, // ТОВА Е КЛЮЧОВО
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to toggle follow status");
      }

      const data = await res.json();

      setProfile(prevProfile => {
        if (!prevProfile) return null;

        return {
          ...prevProfile,
          isFollowing: data.isFollowing,
          stats: {
            ...prevProfile.stats,
            followers: formatNumberShort(data.followers),
          },
        };
      });

    } catch (err) {
      console.error("Failed to toggle follow:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle follow status");

      setIsFollowing(prev => !prev);
    }
  };

  return {
    profile,
    isLoading,
    error,
    isFollowing,
    toggleFollow,
    refetch: () => identifierToFetch && fetchProfile(identifierToFetch.toString()),
  };
};