import {
    Bell,
    FileText,
    CheckCircle2,
    XCircle,
    Mail,
    MessageSquare,
    DollarSign,
    Package,
    Wallet,
    Flag,
    ThumbsUp,
} from "lucide-react";

// Single source of truth for how every notification type is presented across the
// dropdown, the list item, and the detail modal. Keeps icons + i18n consistent.

type TFunc = (key: string) => string;

// Notification types that belong to the payment / escrow flow. These get a richer
// card in the detail modal instead of the generic "Related to …" row.
export const PAYMENT_FLOW_TYPES = [
    "campaign_finished",
    "brand_approved",
    "payment_released",
    "payment_completed",
];

const TITLE_KEYS: Record<string, string> = {
    proposal_received: "mvpNotifications.proposalReceived",
    proposal_accepted: "mvpNotifications.proposalAccepted",
    proposal_rejected: "mvpNotifications.proposalDeclined",
    proposal_declined: "mvpNotifications.proposalDeclined",
    campaign_invite: "mvpNotifications.campaignInvitation",
    invite_accepted: "mvpNotifications.inviteAccepted",
    invite_declined: "mvpNotifications.inviteDeclined",
    campaign_finished: "mvpNotifications.campaignFinished",
    brand_approved: "mvpNotifications.brandApproved",
    payment_released: "mvpNotifications.paymentReleased",
    payment_completed: "mvpNotifications.paymentCompleted",
};

const MESSAGE_KEYS: Record<string, string> = {
    proposal_received: "mvpNotifications.proposalReceivedMsg",
    proposal_accepted: "mvpNotifications.proposalAcceptedMsg",
    proposal_rejected: "mvpNotifications.proposalRejectedMsg",
    proposal_declined: "mvpNotifications.proposalRejectedMsg",
    campaign_invite: "mvpNotifications.campaignInviteMsg",
    invite_accepted: "mvpNotifications.inviteAcceptedMsg",
    invite_declined: "mvpNotifications.inviteDeclinedMsg",
    campaign_finished: "mvpNotifications.campaignFinishedMsg",
    brand_approved: "mvpNotifications.brandApprovedMsg",
    payment_released: "mvpNotifications.paymentReleasedMsg",
    payment_completed: "mvpNotifications.paymentCompletedMsg",
    message: "mvpNotifications.messageReceived",
};

const CATEGORY_KEYS: Record<string, string> = {
    proposal_received: "mvpNotifications.typeProposal",
    proposal_accepted: "mvpNotifications.typeProposal",
    proposal_rejected: "mvpNotifications.typeProposal",
    campaign_invite: "mvpNotifications.typeInvite",
    invite_accepted: "mvpNotifications.typeInvite",
    invite_declined: "mvpNotifications.typeInvite",
    message: "mvpNotifications.typeMessage",
    campaign_finished: "mvpNotifications.typePayment",
    brand_approved: "mvpNotifications.typePayment",
    payment_released: "mvpNotifications.typePayment",
    payment_completed: "mvpNotifications.typePayment",
};

export const getNotificationIcon = (type: string) => {
    switch (type) {
        case "proposal_received": return <FileText className="h-5 w-5 text-primary" />;
        case "proposal_accepted": return <CheckCircle2 className="h-5 w-5 text-primary" />;
        case "proposal_rejected":
        case "proposal_declined": return <XCircle className="h-5 w-5 text-primary" />;
        case "campaign_invite": return <Mail className="h-5 w-5 text-primary" />;
        case "invite_accepted": return <CheckCircle2 className="h-5 w-5 text-primary" />;
        case "invite_declined": return <XCircle className="h-5 w-5 text-primary" />;
        case "message": return <MessageSquare className="h-5 w-5 text-primary" />;
        case "campaign_finished": return <Flag className="h-5 w-5 text-primary" />;
        case "brand_approved": return <ThumbsUp className="h-5 w-5 text-primary" />;
        case "payment_released": return <Wallet className="h-5 w-5 text-primary" />;
        case "payment_completed": return <CheckCircle2 className="h-5 w-5 text-primary" />;
        case "payment": return <DollarSign className="h-5 w-5 text-primary" />;
        case "campaign": return <Package className="h-5 w-5 text-primary" />;
        default: return <Bell className="h-5 w-5 text-primary" />;
    }
};

export const translateNotificationTitle = (t: TFunc, type: string, fallback: string) => {
    const key = TITLE_KEYS[type];
    return key ? t(key) : fallback;
};

export const translateNotificationMessage = (t: TFunc, type: string, fallback: string) => {
    const key = MESSAGE_KEYS[type];
    return key ? t(key) : fallback;
};

export const translateNotificationCategory = (t: TFunc, type: string) => {
    const key = CATEGORY_KEYS[type];
    if (key) return t(key);
    const firstWord = type.split("_")[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};
