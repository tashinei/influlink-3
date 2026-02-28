import { useUserStore } from '@/store/useUserStore';
import { InstagramAnalytics } from '@/types/profile';
import { useState, useEffect, useCallback } from 'react';

export const useInstagramAnalytics = (userId: string | undefined) => {
    const [data, setData] = useState<InstagramAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const { token } = useUserStore();

    const fetchAnalytics = useCallback(async () => {
        if (!userId || !token) return; // wait until both exist
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/instagram/analytics/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
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
    }, [userId, token]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    return { data, loading, refetch: fetchAnalytics };
};