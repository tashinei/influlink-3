export interface Creator {
  id: string;
  handle: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;

  niche: string[];              // ⬅ multiple niches
  platforms: string[];

  followers: number;
  engagementRate: number;

  location?: string;            // country
  language?: string;

  contentTypes?: string[];
  collabTypes?: string[];

  priceRange?: string;          // maps to budgetRanges
  availableNow?: boolean;

  isVIP: boolean;
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Platform {
  name: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  followers: number;
  username: string;
}

export type SortOption = 'followers' | 'engagement' | 'name' | 'recent';
export type ViewMode = 'grid' | 'list';

export type FollowerRange =
  | "nano"
  | "micro"
  | "mid"
  | "macro"
  | "mega"
  | null;

export type EngagementRate =
  | "any"
  | "low"
  | "medium"
  | "high";

export interface FilterState {
  niche: string[];
  platforms: string[];
  languages: string[];

  contentTypes: string[];
  collabTypes: string[];

  followerRange: "nano" | "micro" | "mid" | "macro" | "mega" | null;
  engagementRate: "low" | "medium" | "high" | "any";

  country: string | null;

  budgetRange: string | null;

  isVIP: boolean;
  availableNow: boolean;
}



