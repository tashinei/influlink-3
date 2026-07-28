import { useEffect, useState } from "react";
import { bg, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Clock, FileText, DollarSign, CheckCircle2, XCircle, Loader2, MessageSquare, Package, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";
import {
  getNotificationIcon,
  getNotificationCircleClass,
  translateNotificationTitle,
  translateNotificationMessage,
} from "@/utils/notificationLabels";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  entity_type?: string;
  entity_id?: string;
  is_read: number;
  created_at: string;
}

interface NotificationDropdownProps {
  className?: string;
  setDropdownOpen: (open: boolean) => void;
  onNotificationSelect: (notification: Notification) => void;
}

export default function NotificationDropdown({ className, setDropdownOpen, onNotificationSelect }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const { user } = useUserStore();
  const { t, language } = useTranslation();
  const languageSetting = language === "bg" ? bg : enUS;

  useEffect(() => {
    setNotifications([]);
    setLoading(true);
    if (!user) { setLoading(false); return; }

    fetch(`${API_BASE_URL}/notifications`, { credentials: "include", headers: { "Content-Type": "application/json" } })
      .then(res => res.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to fetch notifications:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        setNotifications(prev => prev.map(x => x.id === notification.id ? { ...x, is_read: 1 } : x));
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }

    // Close dropdown and open modal in parent
    setDropdownOpen(false);
    onNotificationSelect(notification);
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      toast.error("Could not update notifications");
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-popover z-50 overflow-hidden",
      !className && "absolute right-0 top-full mt-2 w-[380px] rounded-lg border shadow-xl",
      className,
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-popover rounded-t-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">{t("mvpNotifications.title")}</h2>
          {unreadCount > 0 && (
            <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full text-xs">{unreadCount}</Badge>
          )}
        </div>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={handleMarkAllRead}>
            {t("mvpNotifications.markAll")}
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-[350px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("mvpNotifications.loadingNotifications")}</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="rounded-full bg-muted p-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">We'll notify you when something arrives</p>
            </div>
          </div>
        )}

        <div className="divide-y">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${!n.is_read ? "bg-primary/5" : ""}`}
            >
              <div
                className={cn(
                  "flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full",
                  getNotificationCircleClass(n.type)
                )}
              >
                {getNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm line-clamp-1 ${!n.is_read ? "font-semibold" : "font-medium"}`}>
                    {translateNotificationTitle(t, n.type, n.title)}
                  </p>
                  {!n.is_read && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {translateNotificationMessage(t, n.type, n.message)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: languageSetting })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}