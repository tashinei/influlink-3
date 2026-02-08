import { useState, useEffect, useRef } from "react";

export const useLiveNotifications = (user: any) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevCountRef = useRef(0);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // 1. Light check: just the number
      const countRes = await fetch(`${API_BASE_URL}/notifications/unread-count`, { credentials: "include" });
      const { count } = await countRes.json();

      // 2. Only fetch full list if count is different (new notification or one was read)
      if (count !== prevCountRef.current) {
        const listRes = await fetch(`${API_BASE_URL}/notifications`, { credentials: "include" });
        const listData = await listRes.json();
        
        setNotifications(listData);
        setUnreadCount(count);
        
        // Trigger a sound if a NEW notification arrived
        if (count > prevCountRef.current) {
          console.log("New notification received!");
          // Optional: new Audio('/pop.mp3').play();
        }
        
        prevCountRef.current = count;
      }
    } catch (err) {
      console.error("Live update failed:", err);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Initial fetch

    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000); // 20 seconds: balance between "live" and server load

    return () => clearInterval(interval);
  }, [user]);

  return { notifications, unreadCount, refresh: fetchNotifications };
};