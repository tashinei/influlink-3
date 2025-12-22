export type FollowerRangePreset =
  | "nano"
  | "micro"
  | "mid"
  | "macro"
  | "mega";

export const FOLLOWER_PRESETS: Record<
  FollowerRangePreset,
  { label: string; min: number; max: number }
> = {
  nano: { label: "Nano (0 – 10K)", min: 0, max: 10_000 },
  micro: { label: "Micro (10K – 100K)", min: 10_000, max: 100_000 },
  mid: { label: "Mid (100K – 500K)", min: 100_000, max: 500_000 },
  macro: { label: "Macro (500K – 1M)", min: 500_000, max: 1_000_000 },
  mega: { label: "Mega (1M+)", min: 1_000_000, max: 10_000_000 },
};

export const ENGAGEMENT_PRESETS: Record<string, { label: string ,min: number; max: number }> = {
    any: {label: "Any" ,  min: 0, max: 100 },
  low: { label: "Low" ,min: 0, max: 2 },
  medium: { label: "Medium" ,min: 2, max: 5 },
  high: {label: "High", min: 5, max: 100 },
};