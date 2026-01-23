import { FaRegBell } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface NotificationBellProps {
  unreadCount?: number;
  onClick?: () => void;
  className?: string;
  color?: string;
}

export default function NotificationBell({ 
  unreadCount = 0, 
  onClick,
  className,
  color = ""
}: NotificationBellProps) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`relative ${className || ""}`}
      onClick={onClick}
    >
      <FaRegBell className={`!h-6 !w-6 ${color}`} />
    </Button>
  );
}
