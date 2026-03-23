import { useUserStore } from '@/store/useUserStore';
import { InstagramAnalytics } from '@/types/profile';
import { useState, useEffect, useCallback } from 'react';

export const useInstagramAnalytics = (userId: string | undefined) => {
    const [data, setData] = useState<InstagramAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const { user } = useUserStore();

    const fetchAnalytics = useCallback(async () => {
        if (!userId || !user) return;
        setLoading(true);
        try {
            await fetch(`${API_BASE_URL}/instagram/sync`, {
                method: "POST",
                credentials: "include",
            });

            const res = await fetch(`${API_BASE_URL}/instagram/analytics/${userId}`, {
                credentials: "include",
            });

            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                setData(null);
                console.warn("Failed to fetch IG analytics", await res.text());
            }
        } catch (err) {
            console.error("Error fetching IG analytics:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [userId, user]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    return { data, loading, refetch: fetchAnalytics };
};