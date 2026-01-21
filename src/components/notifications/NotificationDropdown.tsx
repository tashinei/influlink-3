import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Bell,
    BellRing,
    Clock,
    FileText,
    DollarSign,
    CheckCircle2,
    XCircle,
    Loader2,
    MessageSquare,
    AlertCircle,
    Package
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import avatarPickPlaceholder from "@/assets/avatarPickPlaceholder.png";
import NotificationItem from "./NotificationItem";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    entity_type?: string;
    entity_id?: string;
    is_read: number;
    created_at: string;
}

interface ProposalDetails {
    id: string;
    creator_id: string;
    campaign_id?: string;
    message: string;
    proposed_price?: number;
    status: string;
}

interface CreatorProfile {
    id: string;
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
}

interface NotificationDropdownProps {
    className?: string;
    setDropdownOpen: (open: boolean) => void;
}

const API_BASE_URL = "http://localhost:3000/api";
const API_BASE = "http://localhost:3000"

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "proposal_received":
            return <FileText className="h-5 w-5 text-primary" />;
        case "proposal_accepted":
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case "proposal_rejected":
            return <XCircle className="h-5 w-5 text-destructive" />;
        case "message":
            return <MessageSquare className="h-5 w-5 text-blue-500" />;
        case "payment":
            return <DollarSign className="h-5 w-5 text-emerald-500" />;
        case "campaign":
            return <Package className="h-5 w-5 text-purple-500" />;
        default:
            return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
};

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
        case "accepted":
            return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Accepted</Badge>;
        case "rejected":
            return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
        case "completed":
            return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function NotificationDropdown({ className, setDropdownOpen }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [proposalDetails, setProposalDetails] = useState<ProposalDetails | null>(null);
    const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
    const [proposalLoading, setProposalLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<"accept" | "decline" | null>(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    useEffect(() => {
        fetch(`${API_BASE_URL}/notifications`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setNotifications(data))
            .catch((err) => console.error("Failed to fetch notifications:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleClick = async (notification: Notification) => {
        // Mark as read locally
        setNotifications((prev) =>
            prev.map((x) => (x.id === notification.id ? { ...x, is_read: 1 } : x))
        );

        setSelectedNotification(notification);
        setCreatorProfile(null);

        // Fetch proposal details if relevant
        if (notification.type === "proposal_received" && notification.entity_id) {
            setProposalLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/proposals/${notification.entity_id}`, {
                    credentials: "include",
                });
                const proposalData = await res.json();
                setProposalDetails(proposalData);

                // Fetch creator profile using creator_id
                if (proposalData.creator_id) {
                    const profileRes = await fetch(`${API_BASE_URL}/profiles/${proposalData.creator_id}`, {
                        credentials: "include",
                    });
                    const profileData = await profileRes.json();
                    setCreatorProfile({
                        id: profileData.id,
                        name: profileData.name,
                        handle: profileData.handle,
                        avatar: profileData.avatar,
                        verified: profileData.verified,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch proposal details:", err);
                setProposalDetails(null);
                setCreatorProfile(null);
            } finally {
                setProposalLoading(false);
            }
        } else {
            setProposalDetails(null);
        }
    };

    const closeModal = () => setSelectedNotification(null);

    const handleClickAvatar = () => {
        closeModal();
        setDropdownOpen(false);
    };

    const handleProposalAction = async (action: "accept" | "decline") => {
        if (!proposalDetails) return;

        setActionLoading(action);

        try {
            const res = await fetch(`${API_BASE_URL}/proposals/${proposalDetails.id}/action`, {
                method: "POST", // Changed to POST
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action }), // Send 'accept' or 'decline'
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update proposal");

            // Update local state with the status returned from the server
            setProposalDetails({ ...proposalDetails, status: data.status });

            toast.success(
                action === "accept"
                    ? "Proposal accepted! The creator has been notified."
                    : "Proposal declined."
            );

            closeModal();
        } catch (err: any) {
            console.error(`Failed to ${action} proposal:`, err);
            toast.error(err.message || `Failed to ${action} proposal.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSelectNotification = async (notification: Notification) => {
        // Mark as read locally
        setNotifications((prev) =>
            prev.map((x) => (x.id === notification.id ? { ...x, is_read: 1 } : x))
        );

        setSelectedNotification(notification);
        setCreatorProfile(null);

        // Fetch proposal details if relevant
        if (notification.type === "proposal_received" && notification.entity_id) {
            setProposalLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/proposals/${notification.entity_id}`, {
                    credentials: "include",
                });
                const proposalData = await res.json();
                setProposalDetails(proposalData);

                if (proposalData.creator_id) {
                    const profileRes = await fetch(`${API_BASE_URL}/profiles/${proposalData.creator_id}`, {
                        credentials: "include",
                    });
                    const profileData = await profileRes.json();
                    setCreatorProfile({
                        id: profileData.id,
                        name: profileData.name,
                        handle: profileData.handle,
                        avatar: profileData.avatar,
                        verified: profileData.verified,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch proposal details:", err);
            } finally {
                setProposalLoading(false);
            }
        } else {
            setProposalDetails(null);
        }
    };

    return (
        <>
            {/* Dropdown Panel - positioned absolutely */}
            <div
                className={`absolute right-0 top-full mt-2 w-[380px] rounded-lg border bg-popover shadow-xl z-50 ${className || ""}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-popover rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-primary" />
                        <h2 className="text-base font-semibold">Notifications</h2>
                        {unreadCount > 0 && (
                            <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Content */}
                <ScrollArea className="h-[350px]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading notifications...</p>
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="rounded-full bg-muted p-4">
                                <Bell className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">No notifications yet</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    We'll notify you when something arrives
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="divide-y max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    getNotificationIcon={getNotificationIcon} // pass your icon helper
                                    onRead={(id) => {
                                        // Update local state so the dot disappears immediately
                                        setNotifications(prev =>
                                            prev.map(notif => notif.id === id ? { ...notif, is_read: 1 } : notif)
                                        );
                                    }}
                                    onClick={(notif) => {
                                        handleSelectNotification(notif);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                No notifications yet
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Notification Detail Modal */}
            <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className={`${selectedNotification?.type === "proposal_accepted" || selectedNotification?.type === "proposal_rejected"
                    ? "max-w-md max-h-[30vh]"
                    : "max-w-lg"
                    } p-0 gap-0 overflow-hidden`}>
                    {/* Simple Modal for proposal_accepted / proposal_rejected */}
                    {(selectedNotification?.type === "proposal_accepted" || selectedNotification?.type === "proposal_rejected") ? (
                        <>
                            <div className="px-6 pt-8 pb-6 text-center">
                                <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${selectedNotification?.type === "proposal_accepted"
                                    ? "bg-green-100 dark:bg-green-900/30"
                                    : "bg-red-100 dark:bg-red-900/30"
                                    }`}>
                                    {selectedNotification?.type === "proposal_accepted" ? (
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    )}
                                </div>
                                <DialogTitle className="text-xl font-semibold mb-2">
                                    {selectedNotification?.title}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    {selectedNotification?.message}
                                </DialogDescription>
                                <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {selectedNotification?.created_at
                                        ? formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true })
                                        : "Unknown"}
                                </p>
                            </div>
                            <div className="px-6 py-4 border-t flex justify-center">
                                <Button variant="outline" size="sm" onClick={() => {
                                    closeModal();
                                    setTimeout(() => {
                                        setDropdownOpen(false);
                                    }, 200);
                                }}>
                                    Close
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Modal Header */}
                            <DialogHeader className="px-6 pt-6 pb-4 border-b">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 p-2 rounded-full bg-muted">
                                        {selectedNotification && getNotificationIcon(selectedNotification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="text-lg font-semibold pr-8">
                                            {selectedNotification?.title}
                                        </DialogTitle>
                                        <DialogDescription className="mt-1 text-sm">
                                            {selectedNotification?.message}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Modal Content */}
                            <ScrollArea className="max-h-[60vh]">
                                <div className="px-6 py-4 space-y-4">
                                    {/* Notification Meta */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Type</p>
                                                <p className="text-sm font-medium capitalize">
                                                    {selectedNotification?.type?.replace(/_/g, " ")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Received</p>
                                                <p className="text-sm font-medium">
                                                    {selectedNotification?.created_at
                                                        ? formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true })
                                                        : "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedNotification?.entity_type && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Related To</p>
                                                <p className="text-sm font-medium capitalize">
                                                    {selectedNotification.entity_type} #{selectedNotification.entity_id}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Proposal Details Section */}
                                    {selectedNotification?.type === "proposal_received" && (
                                        <>
                                            <Separator />

                                            <div>
                                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Proposal Details
                                                </h4>

                                                {proposalLoading ? (
                                                    <div className="flex items-center justify-center py-8 gap-3">
                                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">Loading proposal...</p>
                                                    </div>
                                                ) : proposalDetails ? (
                                                    <div className="space-y-3">
                                                        {/* Creator Card - Horizontal Style */}
                                                        {creatorProfile && (
                                                            <Link
                                                                to={`/${creatorProfile.handle}`}
                                                                onClick={handleClickAvatar}
                                                                className="block relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-primary/85 p-4 shadow-lg hover:shadow-xl transition-shadow"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    {/* Avatar */}
                                                                    <div className="relative flex-shrink-0">
                                                                        <div className="h-14 w-14 rounded-full ring-2 ring-white/30 overflow-hidden">
                                                                            <img
                                                                                src={`${API_BASE}${creatorProfile.avatar}` || avatarPickPlaceholder}
                                                                                alt={creatorProfile.name}
                                                                                className="h-full w-full object-cover"
                                                                                onError={(e) => {
                                                                                    const target = e.currentTarget as HTMLImageElement;
                                                                                    target.onerror = null;
                                                                                    target.src = avatarPickPlaceholder;
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Info */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="text-base font-bold text-white truncate">
                                                                                {creatorProfile.name}
                                                                            </h3>
                                                                            {creatorProfile.verified && (
                                                                                <CheckCircle2 className="h-4 w-4 text-white/80 flex-shrink-0" />
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-white/70 truncate">Creator</p>
                                                                        <p className="text-xs text-white/50 mt-1">Click to view portfolio</p>
                                                                    </div>

                                                                    {/* Stats */}
                                                                    <div className="flex items-center gap-4 text-white/90">
                                                                        <div className="text-center">
                                                                            <p className="text-lg font-bold">${proposalDetails.proposed_price?.toLocaleString() || "N/A"}</p>
                                                                            <p className="text-xs text-white/60">Price</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        )}

                                                        {/* Message */}
                                                        <div className="p-3 rounded-lg border bg-card">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                                <p className="text-xs text-muted-foreground">Message</p>
                                                            </div>
                                                            <p className="text-sm">{proposalDetails.message}</p>
                                                        </div>

                                                        {/* Price and Status Row */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="p-3 rounded-lg border bg-card">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                    <p className="text-xs text-muted-foreground">Proposed Price</p>
                                                                </div>
                                                                <p className="text-lg font-semibold text-primary">
                                                                    {proposalDetails.proposed_price !== null
                                                                        ? `$${proposalDetails.proposed_price.toLocaleString()}`
                                                                        : "N/A"}
                                                                </p>
                                                            </div>
                                                            <div className="p-3 rounded-lg border bg-card">
                                                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                                                {getStatusBadge(proposalDetails.status)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                                        <XCircle className="h-8 w-8 text-destructive/50" />
                                                        <p className="text-sm text-muted-foreground">
                                                            Failed to load proposal details
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                    {selectedNotification?.is_read ? "Read" : "Unread"}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    {selectedNotification?.type === "proposal_received" && proposalDetails && proposalDetails.status === "pending" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleProposalAction("decline")}
                                                disabled={actionLoading !== null}
                                            >
                                                {actionLoading === "decline" ? (
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                )}
                                                Decline
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleProposalAction("accept")}
                                                disabled={actionLoading !== null}
                                            >
                                                {actionLoading === "accept" ? (
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                )}
                                                Accept
                                            </Button>
                                        </>
                                    )}
                                    {(selectedNotification?.type !== "proposal_received" || !proposalDetails || proposalDetails.status !== "pending") && (
                                        <Button variant="outline" size="sm" onClick={() => {
                                            closeModal();
                                            setTimeout(() => {
                                                setDropdownOpen(false);
                                            }, 200);
                                        }}>
                                            Close
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
