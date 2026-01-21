import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
// import { getNotificationIcon } from "./utils"; // Assuming you have this helper

const API_BASE_URL = "http://localhost:3000/api";

export default function NotificationItem({ notification, onRead, onClick, getNotificationIcon }) {
    const handleClick = async () => {
        if (!notification.is_read) {
            await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
                method: "POST",
                credentials: "include",
            });
            onRead(notification.id);
        }
        // Trigger the modal opening and fetching in the parent
        if (onClick) onClick(notification);
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b ${!notification.is_read ? "bg-primary/5" : ""
                }`}
        >
            {/* Icon Column */}
            <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm line-clamp-1 ${!notification.is_read ? "font-semibold" : "font-medium"}`}>
                        {notification.title}
                    </p>
                    {!notification.is_read && (
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                </p>

                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
            </div>
        </button>
    );
}