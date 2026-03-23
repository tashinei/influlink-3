import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bg, enUS } from "date-fns/locale";
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
    ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import avatarPickPlaceholder from "@/assets/avatarPickPlaceholder.png";
import { useTranslation } from "@/hooks/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = "https://api.influ-link.com";

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

interface NotificationDetailModalProps {
    notification: Notification | null;
    onClose: () => void;
    onDropdownClose?: () => void;
    onOpenChat?: (partner: any) => void; 
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "proposal_received": return <FileText className="h-5 w-5 text-primary" />;
        case "proposal_accepted": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case "proposal_rejected": return <XCircle className="h-5 w-5 text-destructive" />;
        case "campaign_invite": return <Mail className="h-5 w-5 text-primary" />;
        case "message": return <MessageSquare className="h-5 w-5 text-blue-500" />;
        case "payment": return <DollarSign className="h-5 w-5 text-emerald-500" />;
        case "campaign": return <Package className="h-5 w-5 text-purple-500" />;
        default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
};

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case "pending": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
        case "accepted": return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Accepted</Badge>;
        case "rejected": return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
        case "completed": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export function NotificationDetailModal({ notification, onClose, onDropdownClose, onOpenChat }: NotificationDetailModalProps) {
    const [proposalDetails, setProposalDetails] = useState<ProposalDetails | null>(null);
    const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
    const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
    const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
    const [proposalLoading, setProposalLoading] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<"accept" | "decline" | null>(null);

    const { t, language } = useTranslation();
    const languageSetting = language === "bg" ? bg : enUS;

    const [senderProfile, setSenderProfile] = useState<CreatorProfile | null>(null);

    useEffect(() => {
        if (!notification) {
            setProposalDetails(null);
            setCreatorProfile(null);
            setInviteDetails(null);
            setBrandProfile(null);
            setSenderProfile(null);
            return;
        }

        if (notification.type === "proposal_received" && notification.entity_id) {
            setProposalLoading(true);
            fetch(`${API_BASE_URL}/proposals/${notification.entity_id}`, { credentials: "include" })
                .then(res => res.json())
                .then(async (proposalData) => {
                    if (proposalData.error) {
                        setProposalDetails(null);
                        return;
                    }
                    setProposalDetails(proposalData);
                    if (proposalData.creator_id) {
                        const profileRes = await fetch(`${API_BASE_URL}/profiles/${proposalData.creator_id}`, { credentials: "include" });
                        const profileData = await profileRes.json();
                        setCreatorProfile({ id: profileData.id, name: profileData.name, handle: profileData.handle, avatar: profileData.avatar, verified: profileData.verified });
                    }
                })
                .catch(err => console.error("Failed to fetch proposal details:", err))
                .finally(() => setProposalLoading(false));
        }

        if (notification.type === "message" && notification.entity_id) {
            fetch(`${API_BASE_URL}/chats/${notification.entity_id}/partner`, { credentials: "include" })
                .then(res => res.json())
                .then(data => { if (!data.error) setSenderProfile(data); })
                .catch(err => console.error("Failed to fetch sender:", err));
        }

        if (notification.type === "campaign_invite" && notification.entity_id) {
            setInviteLoading(true);
            fetch(`${API_BASE_URL}/invite/${notification.entity_id}`, { credentials: "include" })
                .then(res => res.json())
                .then(async (inviteData) => {
                    setInviteDetails(inviteData);
                    if (inviteData.brand_id) {
                        const brandRes = await fetch(`${API_BASE_URL}/profiles/${inviteData.brand_id}`, { credentials: "include" });
                        const brandData = await brandRes.json();
                        setBrandProfile({ id: brandData.id, name: brandData.name, logo: brandData.avatar, industry: brandData.niche, location: brandData.location, website: brandData.website, verified: brandData.verified });
                    }
                })
                .catch(err => console.error("Failed to fetch invite details:", err))
                .finally(() => setInviteLoading(false));
        }
    }, [notification]);

    const getTranslatedTitle = (type: string, fallback: string) => {
        const keys: Record<string, string> = {
            proposal_received: "mvpNotifications.proposalReceived",
            proposal_accepted: "mvpNotifications.proposalAccepted",
            proposal_declined: "mvpNotifications.proposalDeclined",
            proposal_rejected: "mvpNotifications.proposalDeclined",
            campaign_invite: "mvpNotifications.campaignInvitation",
            invite_accepted: "mvpNotifications.inviteAccepted",
        };
        const key = keys[type];
        return key ? t(key) : fallback;
    };

    const getNotificationCategory = (type: string) => {
        const categoryKeys: Record<string, string> = {
            proposal_received: "mvpNotifications.typeProposal",
            proposal_accepted: "mvpNotifications.typeProposal",
            proposal_rejected: "mvpNotifications.typeProposal",
            campaign_invite: "mvpNotifications.typeInvite",
            invite_accepted: "mvpNotifications.typeInvite",
            invite_declined: "mvpNotifications.typeInvite",
            message: "mvpNotifications.typeMessage",
        };
        const key = categoryKeys[type];
        if (key) return t(key);
        const firstWord = type.split("_")[0];
        return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    };

    const getTranslatedMessage = (n: Notification) => {
        const messageKeys: Record<string, string> = {
            proposal_received: "mvpNotifications.proposalReceivedMsg",
            proposal_accepted: "mvpNotifications.proposalAcceptedMsg",
            proposal_rejected: "mvpNotifications.proposalRejectedMsg",
            campaign_invite: "mvpNotifications.campaignInviteMsg",
            invite_accepted: "mvpNotifications.inviteAcceptedMsg",
            invite_declined: "mvpNotifications.inviteDeclinedMsg",
            message: "mvpNotifications.messageReceived"
        };
        const key = messageKeys[n.type];
        return key ? t(key) : n.message;
    };

    const handleInvitationAction = async (action: "accept" | "decline") => {
        if (!inviteDetails || !brandProfile) return;
        setActionLoading(action);
        try {
            const res = await fetch(`${API_BASE_URL}/invite/${inviteDetails.id}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Failed to update invitation");
            const data = await res.json();
            setInviteDetails({ ...inviteDetails, status: data.status });
            toast.success(`Invitation ${action}ed!`);
            onClose();
        } catch (err) {
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Failed to update proposal");
            const data = await res.json();
            setProposalDetails({ ...proposalDetails, status: data.status });
            toast.success(`Proposal ${action === "accept" ? "accepted" : "declined"}!`);
            onClose();
        } catch (err) {
            toast.error("Action failed.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleClickAvatar = () => {
        onClose();
        onDropdownClose?.();
    };

    return (
        <Dialog open={!!notification} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={`${notification?.type === "proposal_accepted" || notification?.type === "proposal_rejected"
                    ? "max-w-md max-h-fit"
                    : "max-w-lg"
                    } p-4 gap-0 overflow-hidden !flex !flex-col !justify-center max-h-fit`}
            >
                {notification?.type === "proposal_accepted" || notification?.type === "proposal_rejected" ? (
                    <>
                        <div className="px-6 pt-8 pb-6 text-center">
                            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${notification?.type === "proposal_accepted" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                                }`}>
                                {notification?.type === "proposal_accepted"
                                    ? <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    : <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />}
                            </div>
                            <DialogTitle className="text-xl font-semibold mb-2">
                                {notification && getTranslatedTitle(notification.type, notification.title)}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {notification && getTranslatedMessage(notification)}
                            </DialogDescription>
                            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification?.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: languageSetting }) : "Unknown"}
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-center">
                            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader className="px-6 pt-6 pb-4 border-b">
                            <div className="flex text-left items-start gap-3">
                                <div className="flex-shrink-0 p-2 rounded-full bg-muted">
                                    {notification && getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-xl font-semibold mb-2">
                                        {notification && getTranslatedTitle(notification.type, notification.title)}
                                    </DialogTitle>
                                    <DialogDescription className="mt-1 text-sm">
                                        {notification && getTranslatedMessage(notification)}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="!h-fit">
                            <div className="px-6 py-4 space-y-4">
                                {notification?.type !== "message" && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t("mvpNotifications.type")}</p>
                                                <p className="text-sm font-medium">{notification && getNotificationCategory(notification.type)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t("mvpNotifications.received")}</p>
                                                <p className="text-sm font-medium">
                                                    {notification?.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: languageSetting }) : "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {notification?.entity_type && notification?.type !== "campaign_invite" && notification?.type !== "proposal_received" && notification?.type !== "message" && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t("mvpNotifications.relatedTo")}</p>
                                            <p className="text-sm font-medium capitalize">{notification.entity_type} #{notification.entity_id}</p>
                                        </div>
                                    </div>
                                )}

                                {notification?.type === "message" && (
                                    <div className="space-y-3 flex flex-col">
                                        {senderProfile ? (
                                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-primary/85 p-4 shadow-lg flex flex-col w-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full ring-2 ring-white/30 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={senderProfile.avatar ? `${API_BASE}${senderProfile.avatar}` : avatarPickPlaceholder}
                                                            alt={senderProfile.name}
                                                            className="h-full w-full object-cover"
                                                            onError={e => { (e.currentTarget as HTMLImageElement).src = avatarPickPlaceholder; }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm sm:text-base font-bold text-white truncate">{senderProfile.name}</h3>
                                                        <p className="text-xs sm:text-sm text-white/70">@{senderProfile.handle}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 p-3 rounded-lg bg-white w-full sm:w-[80%] sm:self-center">
                                                    <p className="text-xs sm:text-sm text-secondary break-words">{notification.message}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                        <Button
                                            size="sm"
                                            className="w-[45%] sm:w-[30%] py-5 sm:py-6 rounded-xl bg-gradient-to-br from-primary to-secondary text-white self-end"
                                            onClick={() => { onClose(); onDropdownClose?.(); onOpenChat?.(senderProfile);  }}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Open Chat
                                        </Button>
                                    </div>
                                )}

                                {/* Campaign Invite */}
                                {notification?.type === "campaign_invite" && (
                                    <div className="!h-fit">
                                        <Separator />
                                        <div className="max-h-fit">
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">{t("mvpNotifications.campaignInvitation")}</h4>
                                            {inviteLoading ? (
                                                <div className="flex items-center justify-center py-8 gap-3">
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">Loading invitation...</p>
                                                </div>
                                            ) : inviteDetails && !inviteDetails.campaign_name ? (
                                                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                                    <XCircle className="h-8 w-8 text-destructive/50" />
                                                    <p className="text-sm font-medium text-muted-foreground">Campaign no longer available</p>
                                                    <p className="text-xs text-muted-foreground">This campaign was deleted by the brand.</p>
                                                </div>
                                            ) : inviteDetails && brandProfile ? (
                                                <div className="space-y-4">
                                                    <div className="relative overflow-hidden rounded-xl border to-secondary/10 p-1">
                                                        <div className="rounded-lg bg-gradient-to-br from-secondary to-primary/85 p-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="h-16 w-16 rounded-xl border-2 border-border flex items-center justify-center overflow-hidden shadow-sm">
                                                                        {brandProfile.logo
                                                                            ? <img src={`${API_BASE}${brandProfile.logo}`} alt={brandProfile.name} className="h-full w-full object-cover" />
                                                                            : <Building2 className="h-8 w-8 text-white" />}
                                                                    </div>
                                                                    {brandProfile.verified && (
                                                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                                                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-lg font-bold truncate text-white">{brandProfile.name}</h3>
                                                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                                        {brandProfile.industry && <Badge variant="secondary" className="text-xs font-normal">{brandProfile.industry}</Badge>}
                                                                        {brandProfile.location && <span className="flex items-center gap-1 text-white"><MapPin className="h-3 w-3" />{brandProfile.location}</span>}
                                                                    </div>
                                                                    {brandProfile.website && (
                                                                        <a href={brandProfile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline" onClick={e => e.stopPropagation()}>
                                                                            <Globe className="h-3 w-3" />Visit website<ExternalLink className="h-3 w-3" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {inviteDetails.campaign_name && (
                                                        <div className="p-3 rounded-lg border bg-muted/30">
                                                            <div className="flex items-center gap-2 mb-2"><Package className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Campaign</p></div>
                                                            <p className="text-sm font-medium">{inviteDetails.campaign_name}</p>
                                                        </div>
                                                    )}
                                                    {inviteDetails.message && (
                                                        <div className="p-3 rounded-lg border bg-card">
                                                            <div className="flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Personal Message</p></div>
                                                            <p className="text-sm whitespace-pre-wrap">{inviteDetails.message}</p>
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {inviteDetails.campaign_budget && (
                                                            <div className="p-3 rounded-lg border bg-card">
                                                                <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Budget</p></div>
                                                                <p className="text-lg font-semibold text-primary">${inviteDetails.campaign_budget.toLocaleString()}</p>
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
                                                    <p className="text-sm font-medium text-muted-foreground">Campaign no longer available</p>
                                                    <p className="text-xs text-muted-foreground">This campaign was deleted by the brand.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Proposal Details */}
                                {notification?.type === "proposal_received" && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />{t("mvpNotifications.proposalDetails")}
                                            </h4>
                                            {proposalLoading ? (
                                                <div className="flex items-center justify-center py-8 gap-3">
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">Loading proposal...</p>
                                                </div>
                                            ) : proposalDetails ? (
                                                <div className="space-y-3">
                                                    {creatorProfile && (
                                                        <Link to={`/${creatorProfile.handle}`} onClick={handleClickAvatar} className="block relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-primary/85 p-4 shadow-lg hover:shadow-xl transition-shadow">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="h-14 w-14 rounded-full ring-2 ring-white/30 overflow-hidden">
                                                                        <img
                                                                            src={`${API_BASE}${creatorProfile.avatar}` || avatarPickPlaceholder}
                                                                            alt={creatorProfile.name}
                                                                            className="h-full w-full object-cover"
                                                                            onError={e => { (e.currentTarget as HTMLImageElement).src = avatarPickPlaceholder; }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="text-base font-bold text-white truncate">{creatorProfile.name}</h3>
                                                                        {creatorProfile.verified && <CheckCircle2 className="h-4 w-4 text-white/80 flex-shrink-0" />}
                                                                    </div>
                                                                    <p className="text-sm text-white/70 truncate">{t("mvpNotifications.creator")}</p>
                                                                    <p className="text-xs text-white/50 mt-1">{t("mvpNotifications.clickToViewPortfolio")}</p>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-white/90">
                                                                    <div className="text-center">
                                                                        <p className="text-lg font-semibold text-white">
                                                                            {proposalDetails.proposed_price != null ? `$${proposalDetails.proposed_price.toLocaleString()}` : "N/A"}
                                                                        </p>
                                                                        <p className="text-xs text-white/60">{t("mvpNotifications.price")}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )}
                                                    <div className="p-3 rounded-lg border bg-card">
                                                        <div className="flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">{t("mvpNotifications.message")}</p></div>
                                                        <p className="text-sm">{proposalDetails.message}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-3 rounded-lg border bg-card">
                                                            <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">{t("mvpNotifications.proposedPrice")}</p></div>
                                                            <p className="text-lg font-semibold text-primary">{proposalDetails.proposed_price !== null ? `$${proposalDetails.proposed_price.toLocaleString()}` : "N/A"}</p>
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
                                                    <p className="text-sm font-medium text-muted-foreground">Campaign no longer available</p>
                                                    <p className="text-xs text-muted-foreground">This campaign was deleted by the brand.</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="px-6 py-4 border-t flex items-center justify-between !p-6">
                            <Badge variant="outline" className="text-xs">{notification?.is_read ? "Read" : "Unread"}</Badge>
                            <div className="flex items-center gap-2">
                                {notification?.type === "proposal_received" && proposalDetails && proposalDetails.status === "pending" && (
                                    <>
                                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleProposalAction("decline")} disabled={actionLoading !== null}>
                                            {actionLoading === "decline" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}Decline
                                        </Button>
                                        <Button size="sm" onClick={() => handleProposalAction("accept")} disabled={actionLoading !== null}>
                                            {actionLoading === "accept" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}Accept
                                        </Button>
                                    </>
                                )}
                                {notification?.type === "campaign_invite" && inviteDetails && inviteDetails.status === "pending" && (
                                    <>
                                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleInvitationAction("decline")} disabled={actionLoading !== null}>
                                            {actionLoading === "decline" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}Decline
                                        </Button>
                                        <Button size="sm" onClick={() => handleInvitationAction("accept")} disabled={actionLoading !== null}>
                                            {actionLoading === "accept" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}Accept
                                        </Button>
                                    </>
                                )}
                                {(notification?.type !== "proposal_received" || !proposalDetails || proposalDetails.status !== "pending") &&
                                    (notification?.type !== "campaign_invite" || !inviteDetails || inviteDetails.status !== "pending") && (
                                        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                                    )}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}