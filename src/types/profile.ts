export interface ProfileData {
  id: string;
  name: string;
  handle: string;
  type: "creator" | "brand";
  niche: string;
  location: string;
  verified: boolean;
  stripeOnboardingComplete: boolean;
  bio: string;
  avatar: string;
  coverImage?: string;
  isVIP: boolean;
  socialLinks: {
    instagram?: string;
    x?: string;
    youtube?: string;
    website?: string;
  };
  stats: {
    followers: string;
    following: string;
    engagementRate: string;
    totalReach: string;
    instagramLinked?: boolean;
  };
}

/** One line of a package: "2 × Reel". */
export interface PlanDeliverable {
  /** Key from PLAN_DELIVERABLES for the plan's platform. */
  type: string;
  /** null on legacy rows stored as free text before deliverables were structured. */
  qty: number | null;
}

/**
 * A fixed-price package on a creator's rate card ("Instagram · Growth — €750").
 * Display-only: brands read it and start a conversation. Nothing here is
 * payable on its own — deals still run through the campaign/escrow flow.
 *
 * Every field except price and description is an enum key (see
 * src/config/planOptions.ts) rendered through i18n, so packages stay
 * comparable between creators.
 */
export interface CreatorPlan {
  id: string;
  /** Key from PLAN_PLATFORMS. */
  platform: string;
  /** Tier key from PLAN_TIERS — the label comes from i18n, not the DB. */
  title: string;
  description: string;
  price: number;
  currency: string;
  /** Turnaround in days, or null when the creator didn't specify one. */
  deliveryDays: number | null;
  deliverables: PlanDeliverable[];
  isFeatured: boolean;
}

export interface PortfolioItem {
  profileId: any;
  id: string;
  title: string;
  brand: string;
  type: string;
  image: string;
  description?: string;
  stats: {
    likes: string;
    views: string;
  };
  createdAt: string;
  isLiked: boolean;
  hasLiked:boolean;
}

export interface NewPostData {
  title: string;
  brand: string;
  type: string;
  imageFile: File | null;
  imagePreview: string;
  description: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  avgEngagement: number;
  newFollowersCount: number;
  viewsChange?: number;
  likesChange?: number;
  engagementChange?: number;
  newFollowersChange?: number;

  engagementOverTime: Array<{ date: string; value: number }>;
  viewsByPlatform: Array<{ platform: string; views: number }>;
  reachTrend: Array<{ date: string; reach: number }>;
  topPerformingPosts: Array<{ id: string; title: string; engagement: number }>;
}

export interface InstagramAnalytics {
  // Database IDs
  ig_user_id: string;
  
  // High-level Stats (The Header Cards)
  followers_count: number;
  follows_count: number;
  media_count: number;
  
  // Engagement (The "Pro" Metrics)
  avg_likes: number;
  avg_comments: number;
  engagement_rate: number; // (Avg Likes + Avg Comments) / Followers
  
  // Visualization Data (The Radar & Activity)
  interactionsByDay: Array<{ day: string; value: number }>; 
  topHashtags: Array<{ tag: string; count: number }>;
  
  last_updated: string;
}