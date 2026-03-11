import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import NotificationDropdown from "./NotificationDropdown";
import { toast } from "sonner";

interface NotificationFABProps {
  className?: string;
}

export function NotificationFAB({ className }: NotificationFABProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const { token } = useUserStore();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchCount = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      toast.error("Failed to update notifications");
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed right-6 lg:hidden z-40 transition-all duration-300 ease-in-out",
        className,
      )}
    >
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
          <SheetHeader className="border-b flex flex-row items-center justify-between space-y-0">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary flex gap-2"
                onClick={handleMarkAllRead}
                disabled={isMarkingRead}
              >
                {isMarkingRead ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                Mark all read
              </Button>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {" "}
            <NotificationDropdown
              setDropdownOpen={setOpen}
              className="relative border-none shadow-none w-full"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
