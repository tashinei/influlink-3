import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bg, enUS } from 'date-fns/locale';
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
    Package,
    Building2,
    Mail,
    MapPin,
    Globe,
    Sparkles,
    ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import avatarPickPlaceholder from "@/assets/avatarPickPlaceholder.png";
import { useTranslation } from "@/hooks/useTranslation";

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

interface InviteDetails {
    id: string;
    brand_id: string;
    campaign_id: string;
    message?: string;
    status: string;
    campaign_name?: string;
    campaign_budget?: number;
}

interface BrandProfile {
    id: string;
    name: string;
    logo?: string;
    industry?: string;
    location?: string;
    website?: string;
    verified?: boolean;
}

interface NotificationDropdownProps {
    className?: string;
    setDropdownOpen: (open: boolean) => void;
}

const API_BASE_URL = "http://localhost:3000/api";
const API_BASE = "http://localhost:3000";

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "proposal_received":
            return <FileText className="h-5 w-5 text-primary" />;
        case "proposal_accepted":
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case "proposal_rejected":
            return <XCircle className="h-5 w-5 text-destructive" />;
        case "campaign_invite":
            return <Mail className="h-5 w-5 text-primary" />;
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
    const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
    const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
    const [proposalLoading, setProposalLoading] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
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

    const { t } = useTranslation();

    const handleClick = async (notification: Notification) => {
        // 1. Mark as read on backend (using notification.id)
        if (!notification.is_read) {
            try {
                await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
                    method: "POST",
                    credentials: "include",
                });
                // Update local state for immediate feedback
                setNotifications((prev) =>
                    prev.map((x) => (x.id === notification.id ? { ...x, is_read: 1 } : x))
                );
            } catch (err) {
                console.error("Failed to mark read:", err);
            }
        }

        // 2. Clear previous modal state
        setSelectedNotification(notification);
        setCreatorProfile(null);
        setBrandProfile(null);
        setInviteDetails(null);
        setProposalDetails(null);

        // 3. Fetch Proposal Details (using notification.entity_id)
        if (notification.type === "proposal_received" && notification.entity_id) {
            setProposalLoading(true);
            try {
                // Fetch the actual proposal, NOT the read status
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
        }

        // 4. Fetch Invite Details (using notification.entity_id)
        if (notification.type === "campaign_invite" && notification.entity_id) {
            setInviteLoading(true);
            try {
                // Updated to plural 'invites' to match our backend route
                const res = await fetch(`${API_BASE_URL}/invite/${notification.entity_id}`, {
                    credentials: "include",
                });
                const inviteData = await res.json();
                setInviteDetails(inviteData);

                if (inviteData.brand_id) {
                    const brandRes = await fetch(`${API_BASE_URL}/profiles/${inviteData.brand_id}`, {
                        credentials: "include",
                    });
                    const brandData = await brandRes.json();
                    setBrandProfile({
                        id: brandData.id,
                        name: brandData.name,
                        logo: brandData.avatar,
                        industry: brandData.niche,
                        location: brandData.location,
                        website: brandData.website,
                        verified: brandData.verified,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch invite details:", err);
            } finally {
                setInviteLoading(false);
            }
        }
    };

    const getTranslatedTitle = (type: string, fallback: string, t: any) => {
        const keys: Record<string, string> = {
            "proposal_received": "mvpNotifications.proposalReceived",
            "proposal_accepted": "mvpNotifications.proposalAccepted",
            "proposal_declined": "mvpNotifications.proposalDeclined", // Note: match your DB type
            "proposal_rejected": "mvpNotifications.proposalDeclined", // Mapping both to same key
            "campaign_invite": "mvpNotifications.campaignInvitation",
            "invite_accepted": "mvpNotifications.inviteAccepted",
        };

        const key = keys[type];
        return key ? t(key) : fallback;
    };

    const getNotificationCategory = (type: string, t: any) => {
        const categoryKeys: Record<string, string> = {
            "proposal_received": "mvpNotifications.typeProposal",
            "proposal_accepted": "mvpNotifications.typeProposal",
            "proposal_rejected": "mvpNotifications.typeProposal",
            "campaign_invite": "mvpNotifications.typeInvite",
            "invite_accepted": "mvpNotifications.typeInvite",
            "invite_declined": "mvpNotifications.typeInvite",
            "message": "mvpNotifications.typeMessage"
        };

        const key = categoryKeys[type];

        if (key) {
            return t(key);
        }

        const firstWord = type.split('_')[0];
        return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    };

    const getTranslatedMessage = (notification: any, t: any) => {
        const messageKeys: Record<string, string> = {
            "proposal_received": "mvpNotifications.proposalReceivedMsg",
            "proposal_accepted": "mvpNotifications.proposalAcceptedMsg",
            "proposal_rejected": "mvpNotifications.proposalRejectedMsg",
            "campaign_invite": "mvpNotifications.campaignInviteMsg",
            "invite_accepted": "mvpNotifications.inviteAcceptedMsg",
            "invite_declined": "mvpNotifications.inviteDeclinedMsg"
        };

        const key = messageKeys[notification.type];

        return key ? t(key) : notification.message;
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: "POST",
                credentials: "include",
            });

            if (res.ok) {
                // Update local state to show everything as read
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
                toast.success("All notifications marked as read");
            }
        } catch (err) {
            console.error("Failed to mark all as read:", err);
            toast.error("Could not update notifications");
        }
    };

    const closeModal = () => setSelectedNotification(null);

    const handleClickAvatar = () => {
        closeModal();
        setDropdownOpen(false);
    };

    const handleInvitationAction = async (action: "accept" | "decline") => {
        if (!inviteDetails || !brandProfile) return;

        setActionLoading(action);

        try {
            const res = await fetch(`${API_BASE_URL}/invite/${inviteDetails.id}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: action }), // Backend expects "action" key
            });

            if (!res.ok) throw new Error("Failed to update invitation");

            const data = await res.json();

            // Update local state with the status returned from backend
            setInviteDetails({ ...inviteDetails, status: data.status });

            toast.success(`Invitation ${action}ed!`);
            closeModal();
        } catch (err) {
            console.error(`Failed to ${action} invitation:`, err);
            toast.error(`Failed to ${action} invitation.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleProposalAction = async (action: "accept" | "decline") => {
        if (!proposalDetails || !creatorProfile) return;

        setActionLoading(action);

        try {
            const res = await fetch(`${API_BASE_URL}/proposals/${proposalDetails.id}/action`, {
                method: "POST", // Match the backend we wrote
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: action }), // Match the backend "action" key
            });

            if (!res.ok) throw new Error("Failed to update proposal");

            const data = await res.json();
            setProposalDetails({ ...proposalDetails, status: data.status });

            toast.success(`Proposal ${action === "accept" ? "accepted" : "declined"}!`);
            closeModal();
        } catch (err) {
            console.error(`Failed to ${action} proposal:`, err);
            toast.error("Action failed.");
        } finally {
            setActionLoading(null);
        }
    };

    const { language } = useTranslation();
    const languageSetting = language === "bg" ? bg : enUS;

    return (
        <>
            <div
                className={`absolute right-0 top-full mt-2 w-[380px] rounded-lg border bg-popover shadow-xl z-50 ${className || ""}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-popover rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold">{t("mvpNotifications.title")}</h2>
                        {unreadCount > 0 && (
                            <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground h-7"
                            onClick={handleMarkAllRead}
                        >
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
                                <p className="text-sm text-muted-foreground mt-1">
                                    We'll notify you when something arrives
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="divide-y">
                        {notifications.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => handleClick(n)}
                                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${!n.is_read ? "bg-primary/5" : ""
                                    }`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm line-clamp-1 ${!n.is_read ? "font-semibold" : "font-medium"}`}>
                                            {getTranslatedTitle(n.type, n.title, t)}
                                        </p>
                                        {!n.is_read && (
                                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                            {getTranslatedMessage(n, t)}
                                        </p>
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

            {/* Notification Detail Modal */}
            <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className={`${selectedNotification?.type === "proposal_accepted" || selectedNotification?.type === "proposal_rejected"
                    ? "max-w-md max-h-fit"
                    : "max-w-lg"
                    } p-4 gap-0 overflow-hidden !flex !flex-col !justify-center max-h-fit`}>
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
                                    {selectedNotification && getTranslatedTitle(selectedNotification.type, selectedNotification.title, t)}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    {selectedNotification && getTranslatedMessage(selectedNotification, t)}
                                </DialogDescription>
                                <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {selectedNotification?.created_at
                                        ? formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true, locale: languageSetting })
                                        : "Unknown"}
                                </p>
                            </div>
                            <div className="px-6 py-4 border-t flex justify-center">
                                <Button variant="outline" size="sm" onClick={closeModal}>
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
                                        <DialogTitle className="text-xl font-semibold mb-2">
                                            {selectedNotification && getTranslatedTitle(selectedNotification.type, selectedNotification.title, t)}
                                        </DialogTitle>
                                        <DialogDescription className="mt-1 text-sm">
                                            {selectedNotification && getTranslatedMessage(selectedNotification, t)}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Modal Content */}
                            <ScrollArea className="!h-fit">
                                <div className="px-6 py-4 space-y-4">
                                    {/* Notification Meta */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t("mvpNotifications.type")}</p>
                                                <p className="text-sm font-medium">
                                                    {selectedNotification && getNotificationCategory(selectedNotification.type, t)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t("mvpNotifications.received")}</p>
                                                <p className="text-sm font-medium">
                                                    {selectedNotification?.created_at
                                                        ? formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true, locale: languageSetting })
                                                        : "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedNotification?.entity_type && selectedNotification?.type !== "campaign_invite" && selectedNotification?.type !== "proposal_received" && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t("mvpNotifications.relatedTo")}</p>
                                                <p className="text-sm font-medium capitalize">
                                                    {selectedNotification.entity_type} #{selectedNotification.entity_id}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Campaign Invite Details Section */}
                                    {selectedNotification?.type === "campaign_invite" && (
                                        <div className="!h-fit">
                                            <Separator />

                                            <div className="max-h-fit">
                                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                    {t("mvpNotifications.campaignInvitation")}
                                                </h4>

                                                {inviteLoading ? (
                                                    <div className="flex items-center justify-center py-8 gap-3">
                                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">Loading invitation...</p>
                                                    </div>
                                                ) : inviteDetails && brandProfile ? (
                                                    <div className="space-y-4">
                                                        {/* Brand Card */}
                                                        <div className="relative overflow-hidden rounded-xl border to-secondary/10 p-1">
                                                            <div className="rounded-lg bg-gradient-to-br from-secondary to-primary/85 p-4">
                                                                <div className="flex items-start gap-4">
                                                                    {/* Brand Logo */}
                                                                    <div className="relative flex-shrink-0">
                                                                        <div className="h-16 w-16 rounded-xl border-2 border-border flex items-center justify-center overflow-hidden shadow-sm">
                                                                            {brandProfile.logo ? (
                                                                                <img
                                                                                    src={`${API_BASE}${brandProfile.logo}`}
                                                                                    alt={brandProfile.name}
                                                                                    className="h-full w-full object-cover"
                                                                                    onError={(e) => {
                                                                                        const target = e.currentTarget as HTMLImageElement;
                                                                                        target.onerror = null;
                                                                                        target.style.display = 'none';
                                                                                        target.parentElement!.innerHTML = '<div class="h-8 w-8 text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg></div>';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <Building2 className="h-8 w-8 text-muted-foreground" />
                                                                            )}
                                                                        </div>
                                                                        {brandProfile.verified && (
                                                                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                                                                <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Brand Info */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h3 className="text-lg font-bold truncate text-white">
                                                                                {brandProfile.name}
                                                                            </h3>
                                                                            <p></p>
                                                                        </div>

                                                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                                            {brandProfile.industry && (
                                                                                <Badge variant="secondary" className="text-xs font-normal">
                                                                                    {brandProfile.industry}
                                                                                </Badge>
                                                                            )}
                                                                            {brandProfile.location && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <MapPin className="h-3 w-3" />
                                                                                    {brandProfile.location}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {brandProfile.website && (
                                                                            <a
                                                                                href={brandProfile.website}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <Globe className="h-3 w-3" />
                                                                                Visit website
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Campaign Details */}
                                                        {inviteDetails.campaign_name && (
                                                            <div className="p-3 rounded-lg border bg-muted/30">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                    <p className="text-xs text-muted-foreground">Campaign</p>
                                                                </div>
                                                                <p className="text-sm font-medium">{inviteDetails.campaign_name}</p>
                                                            </div>
                                                        )}

                                                        {/* Message */}
                                                        {inviteDetails.message && (
                                                            <div className="p-3 rounded-lg border bg-card">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                                    <p className="text-xs text-muted-foreground">Personal Message</p>
                                                                </div>
                                                                <p className="text-sm whitespace-pre-wrap">{inviteDetails.message}</p>
                                                            </div>
                                                        )}

                                                        {/* Budget and Status Row */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {inviteDetails.campaign_budget && (
                                                                <div className="p-3 rounded-lg border bg-card">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                        <p className="text-xs text-muted-foreground">Budget</p>
                                                                    </div>
                                                                    <p className="text-lg font-semibold text-primary">
                                                                        ${inviteDetails.campaign_budget.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div className="p-3 rounded-lg border bg-card">
                                                                <p className="text-xs text-muted-foreground mb-1">{t("mvpNotifications.status")}</p>
                                                                {getStatusBadge(inviteDetails.status)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                                        <XCircle className="h-8 w-8 text-destructive/50" />
                                                        <p className="text-sm text-muted-foreground">
                                                            Invitation data not found - campaign was deleted or you are unauthorized.
                                                        </p>
                                                    </div>
                                                )}
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
                                                    {t("mvpNotifications.proposalDetails")}
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
                                                                        <p className="text-sm text-white/70 truncate">{t("mvpNotifications.creator")}</p>
                                                                        <p className="text-xs text-white/50 mt-1">{t("mvpNotifications.clickToViewPortfolio")}</p>
                                                                    </div>

                                                                    {/* Stats */}
                                                                    <div className="flex items-center gap-4 text-white/90">
                                                                        <div className="text-center">
                                                                            <p className="text-lg font-bold">${proposalDetails.proposed_price?.toLocaleString() || "N/A"}</p>
                                                                            <p className="text-xs text-white/60">{t("mvpNotifications.price")}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        )}

                                                        {/* Message */}
                                                        <div className="p-3 rounded-lg border bg-card">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                                <p className="text-xs text-muted-foreground">{t("mvpNotifications.message")}</p>
                                                            </div>
                                                            <p className="text-sm">{proposalDetails.message}</p>
                                                        </div>

                                                        {/* Price and Status Row */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="p-3 rounded-lg border bg-card">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                    <p className="text-xs text-muted-foreground">{t("mvpNotifications.proposedPrice")}</p>
                                                                </div>
                                                                <p className="text-lg font-semibold text-primary">
                                                                    {proposalDetails.proposed_price !== null
                                                                        ? `$${proposalDetails.proposed_price.toLocaleString()}`
                                                                        : "N/A"}
                                                                </p>
                                                            </div>
                                                            <div className="p-3 rounded-lg border bg-card">
                                                                <p className="text-xs text-muted-foreground mb-1">{t("mvpNotifications.status")}</p>
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
                            <div className="px-6 py-4 border-t flex items-center justify-between !p-6">
                                <Badge variant="outline" className="text-xs">
                                    {selectedNotification?.is_read ? "Read" : "Unread"}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    {/* Proposal Actions */}
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
                                    {/* Campaign Invite Actions */}
                                    {selectedNotification?.type === "campaign_invite" && inviteDetails && inviteDetails.status === "pending" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleInvitationAction("decline")}
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
                                                onClick={() => handleInvitationAction("accept")}
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
                                    {/* Close Button for other cases */}
                                    {(
                                        (selectedNotification?.type !== "proposal_received" || !proposalDetails || proposalDetails.status !== "pending") &&
                                        (selectedNotification?.type !== "campaign_invite" || !inviteDetails || inviteDetails.status !== "pending")
                                    ) && (
                                            <Button variant="outline" size="sm" onClick={closeModal}>
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
