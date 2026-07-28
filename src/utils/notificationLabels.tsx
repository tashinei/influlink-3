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
    AlertTriangle,
    CalendarClock,
    RotateCcw,
    Ban,
    ArrowLeftRight,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Single source of truth for how every notification type is presented across the
// dropdown, the list item, and the detail modal. Keeps icons, colour tone and
// i18n consistent.

type TFunc = (key: string) => string;

// Notification types that belong to the payment / escrow flow. These get a richer
// card in the detail modal instead of the generic "Related to …" row.
export const PAYMENT_FLOW_TYPES = [
    "campaign_finished",
    "brand_approved",
    "payment_released",
    "payment_completed",
];

// ── Colour tone ──────────────────────────────────────────────────────────────
// Each type maps to a semantic tone so the icon + its circle read at a glance:
// green = good, amber = needs attention, red = something ended/failed.
type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TYPE_TONE: Record<string, Tone> = {
    proposal_received: "info",
    proposal_accepted: "success",
    proposal_rejected: "danger",
    proposal_declined: "danger",
    campaign_invite: "info",
    invite_accepted: "success",
    invite_declined: "danger",
    message: "info",
    campaign_finished: "info",
    brand_approved: "success",
    payment_released: "success",
    payment_completed: "success",
    payment: "success",
    campaign: "info",
    // Brand subscription lifecycle
    billing_payment_failed: "warning",
    billing_recovered: "success",
    billing_cancel_scheduled: "warning",
    billing_cancel_reverted: "success",
    billing_ended: "danger",
    billing_plan_changed: "info",
};

const toneOf = (type: string): Tone => TYPE_TONE[type] || "neutral";

const TONE_ICON: Record<Tone, string> = {
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-primary",
    neutral: "text-muted-foreground",
};

const TONE_BG: Record<Tone, string> = {
    success: "bg-emerald-100 dark:bg-emerald-500/15",
    warning: "bg-amber-100 dark:bg-amber-500/15",
    danger: "bg-red-100 dark:bg-red-500/15",
    info: "bg-primary/10",
    neutral: "bg-muted",
};

const ICON_FOR: Record<string, LucideIcon> = {
    proposal_received: FileText,
    proposal_accepted: CheckCircle2,
    proposal_rejected: XCircle,
    proposal_declined: XCircle,
    campaign_invite: Mail,
    invite_accepted: CheckCircle2,
    invite_declined: XCircle,
    message: MessageSquare,
    campaign_finished: Flag,
    brand_approved: ThumbsUp,
    payment_released: Wallet,
    payment_completed: CheckCircle2,
    payment: DollarSign,
    campaign: Package,
    billing_payment_failed: AlertTriangle,
    billing_recovered: CheckCircle2,
    billing_cancel_scheduled: CalendarClock,
    billing_cancel_reverted: RotateCcw,
    billing_ended: Ban,
    billing_plan_changed: ArrowLeftRight,
};

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
    billing_payment_failed: "mvpNotifications.typeBilling",
    billing_recovered: "mvpNotifications.typeBilling",
    billing_cancel_scheduled: "mvpNotifications.typeBilling",
    billing_cancel_reverted: "mvpNotifications.typeBilling",
    billing_ended: "mvpNotifications.typeBilling",
    billing_plan_changed: "mvpNotifications.typeBilling",
};

export const getNotificationIcon = (type: string) => {
    const Icon = ICON_FOR[type] || Bell;
    return <Icon className={cn("h-5 w-5", TONE_ICON[toneOf(type)])} />;
};

// Circle background behind the icon, matching the type's tone. Callers wrap the
// icon: <span class={getNotificationCircleClass(type)}>{getNotificationIcon(type)}</span>
export const getNotificationCircleClass = (type: string) => TONE_BG[toneOf(type)];

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
