export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignType = "email" | "social" | "paid_ads" | "content";

export interface CampaignData {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: Date;
  primaryGoal: string;
  budget: number;
  budgetSpent: number;
  impressions: number;
  reach: number;
  companyLogo?: string;
  referenceImages: string[];
  createdAt: Date;
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  email: "Email",
  social: "Social Media",
  paid_ads: "Paid Ads",
  content: "Content",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};
