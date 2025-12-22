import { Creator } from '@/types/creator';
import { formatFollowers, formatEngagement } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Crown, 
  Heart, 
  Share2, 
  Instagram, 
  Youtube,
  Twitter,
  Users,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CreatorCardProps {
  creator: Creator;
  index: number;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'instagram':
      return <Instagram className="w-4 h-4" />;
    case 'youtube':
      return <Youtube className="w-4 h-4" />;
    case 'twitter':
      return <Twitter className="w-4 h-4" />;
    case 'tiktok':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    default:
      return null;
  }
};

export const CreatorCard = ({ creator, index }: CreatorCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/${creator.handle}`);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${creator.name} saved to favorites!`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/creators/${creator.id}`);
    toast.success('Profile link copied!');
  };

  const API_BASE = "http://localhost:3000"

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer glass-card-hover rounded-2xl overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card Header with Avatar */}
      <div className="relative p-6 pb-4">
        {/* Quick Actions - Show on hover */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
            onClick={handleSave}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Avatar with badges */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={`${API_BASE}${creator.avatar}`}
              alt={creator.name}
              className="w-16 h-16 rounded-full object-cover avatar-ring transition-all duration-300 group-hover:ring-primary/50"
            />
            {creator.isVip && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full badge-vip flex items-center justify-center shadow-lg">
                <Crown className="w-3 h-3" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{creator.name}</h3>
              {creator.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{creator.username}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{creator.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="px-6 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>
      </div>

      {/* Niche Badge */}
      <div className="px-6 pb-4">
        <Badge variant="secondary" className="bg-accent/30 text-accent-foreground hover:bg-accent/50">
          {creator.niche}
        </Badge>
      </div>

      {/* Stats */}
      <div className="px-6 pb-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{formatFollowers(creator.followers)}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{formatEngagement(creator.engagementRate)}</p>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-3">
          {creator.platforms?.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              title={`${formatFollowers(platform.followers)} on ${platform.name}`}
            >
              <PlatformIcon platform={platform.name} />
              <span className="text-xs">{formatFollowers(platform.followers)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with price */}
      <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Starting at</span>
          <span className="font-semibold text-primary">{creator.priceRange.split(' - ')[0]}</span>
        </div>
      </div>
    </article>
  );
};