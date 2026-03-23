export type CampaignStatus = "Draft" | "Active" | "Paused" | "Completed" | "Open";
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
  platforms: string[];
  niches: string[];
  country: string;
  contentTypes: string[];
  language: string[];
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  email: "Email",
  social: "Social Media",
  paid_ads: "Paid Ads",
  content: "Content",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  Open: "Open",
  Draft: "Draft",
  Active: "Active",
  Paused: "Paused",
  Completed: "Completed",
};

export type CampaignFilterState = {
  niches: string[];
  platforms: string[];
  contentTypes: string[];
  collabTypes: string[];
  budgetRange: string | null;
  country: string[];
  countryCode: string[];
  language: string[];
  status?: CampaignStatus | "any";
};

export const defaultCampaignFilters: CampaignFilterState = {
  niches: [],
  platforms: [],
  contentTypes: [],
  collabTypes: [],
  budgetRange: null,
  country: [],
  countryCode: [],
  language: [],
  status: "any",
};

export type CampaignSearchFilters = {
  query?: string;

  niches?: string[];
  platforms?: string[];

  contentTypes?: string[];
  collabTypes?: string[];

  budgetRange?: string | null;
  country?: string | null;
  language?: string[];

  status?: CampaignStatus | "any";
  startDateFrom?: string | null;
  startDateTo?: string | null;
};
