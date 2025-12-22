export const formatFollowers = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const formatEngagement = (rate?: number | string) => {
  if (rate == null) return '0.0%';
  const num = typeof rate === 'string' ? parseFloat(rate) : rate;
  if (isNaN(num)) return '0.0%';
  return num.toFixed(1) + '%';
};

