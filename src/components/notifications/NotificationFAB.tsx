import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import NotificationDropdown, { type Notification } from "./NotificationDropdown";
import { NotificationDetailModal } from "./NotificationDetailModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface NotificationFABProps {
  className?: string;
}

export function NotificationFAB({ className }: NotificationFABProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { user, isRegistered } = useUserStore();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };

  useEffect(() => {
    if (user && isRegistered) {
      fetchCount();
      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setOpen(false);
    }
  }, [user, isRegistered]);

  const navigate = useNavigate();

  if (!user || !isRegistered) {
    return null;
  }

  return (
    <div className={cn("fixed right-6 lg:hidden z-40 transition-all duration-300 ease-in-out", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary via-secondary to-tertiary hover:bg-primary/90 flex items-center justify-center p-0"
          >
            <div className="relative">
              <Bell className="!w-6 !h-6 text-primary-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 !bg-white !text-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="p-0 h-fit rounded-t-[20px] border-t overflow-hidden flex flex-col [&>button]:hidden"
        >
          <div className="flex-1 overflow-y-auto min-h-[300px]">
            <NotificationDropdown
              setDropdownOpen={setOpen}
              className="relative border-none shadow-none w-full"
              onNotificationSelect={setSelectedNotification}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal lives outside Sheet so it survives when sheet closes */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onDropdownClose={() => setOpen(false)}
        onOpenChat={(partner) => {
          setSelectedNotification(null);
          setOpen(false);
          navigate("/profile/me", { state: { openChat: true, partner } });
        }}
      />
    </div>
  );
}