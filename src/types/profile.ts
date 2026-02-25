export interface ProfileData {
  id: string;
  name: string;
  handle: string;
  type: "creator" | "brand";
  niche: string;
  location: string;
  verified: boolean;
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
