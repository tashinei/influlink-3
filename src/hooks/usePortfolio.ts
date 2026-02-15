// hooks/usePortfolio.ts (Final Fixed Version)
import { useState, useEffect, useCallback } from "react";
import { PortfolioItem, NewPostData } from "@/types/profile";
import { useUserStore } from "@/store/useUserStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is not set.");
}


// ✅ 1. Accept an optional targetProfileId parameter
export const usePortfolio = (targetProfileId?: string) => {
  // ID of the logged-in user (used for management actions: add/delete)
  const currentUserId = useUserStore(state => state.user?.id);

  // ID used for fetching portfolio data (TargetId or logged-in ID)
  const idToFetch = targetProfileId || currentUserId;

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useUserStore();

  // Helper function to format large numbers (K/M)
  const formatStat = (num: number, isViews = false): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(isViews ? 0 : 1) + 'K';
    return num.toString();
  };

  // 🔄 2. Use idToFetch for the API call
  const fetchPortfolio = useCallback(async () => {
    if (!idToFetch) {
      setPortfolio([]);
      setError("No profile ID provided for fetching.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the ID determined from targetProfileId or currentUserId
      const response = await fetch(`${API_BASE_URL}/profiles/${idToFetch}/portfolio`, {
        headers: {
          "Content-Type": "application/json",
          // АКО ИМА ТОКЕН, ГО ПРАЩАМЕ:
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch portfolio");
      }

      const data = await response.json();
      const formattedPortfolio = data.map((item: any) => ({
        ...item,
        stats: {
          likes: formatStat(item.stats.likes, false),
          views: formatStat(item.stats.views, true),
        }
      }));
      setPortfolio(formattedPortfolio);

    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch portfolio");
      setPortfolio([]);
    } finally {
      setIsLoading(false);
    }
  }, [idToFetch]); // 🔑 Dependency is now idToFetch

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // hooks/usePortfolio.ts
  const addPost = async (postData: NewPostData): Promise<boolean> => {
    if (!currentUserId) {
      console.error("Cannot add post: User not logged in.");
      return false;
    }

    if (!postData.imageFile) {
      console.error("No file selected for upload.");
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("image", postData.imageFile);
      formData.append("title", postData.title);
      formData.append("brand", postData.brand);
      formData.append("type", postData.type);
      formData.append("description", postData.description);

      const response = await fetch(`${API_BASE_URL}/profiles/${currentUserId}/portfolio`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add post");
      }

      const newPost = await response.json();

      const formattedNewPost: PortfolioItem = {
        ...newPost,
        stats: {
          likes: formatStat(newPost.stats.likes, false),
          views: formatStat(newPost.stats.views, true),
        }
      };

      setPortfolio(prev => [formattedNewPost, ...prev]);
      return true;

    } catch (err) {
      console.error("Failed to add post:", err);
      return false;
    }
  };



  const deletePost = async (postId: string): Promise<boolean> => {
    if (!currentUserId) { // Use currentUserId for permission check
      console.error("Cannot delete post: User not logged in.");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${currentUserId}/portfolio/${postId}`, { // Use currentUserId
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to delete post");

      setPortfolio((prev) => prev.filter((item) => item.id !== postId));
      return true;

    } catch (err) {
      console.error("Failed to delete post:", err);
      return false;
    }
  };

  return {
    portfolio,
    isLoading,
    error,
    addPost,
    deletePost,
    refetch: fetchPortfolio,
  };
};