import { Creator } from '@/types/creator';
import { formatFollowers, formatEngagement } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import avatarPickPlaceholder from "@/assets/avatarPickPlaceholder.png"
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
  onInvite: (creator: Creator) => void;
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
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    default:
      return null;
  }
};

export const CreatorCard = ({ creator, index, onInvite }: CreatorCardProps) => {
  const navigate = useNavigate();
  const handleCardClick = () => navigate(`/${creator.handle}`);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${creator.name} saved to favorites!`, {
      className: "bg-gradient-to-br from-secondary to-primary/85",
      style: {
        color: 'white',
      },
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://influ-link.com/${creator.handle}`);
    toast.success('Profile link copied!', {
      className: "bg-gradient-to-br from-secondary to-primary/85",
      style: {
        color: 'white',
      },
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    });
  };

  const API_BASE = "https://api.influ-link.com";

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer glass-card-hover rounded-2xl overflow-hidden opacity-0 animate-fade-in flex flex-col h-full border-2 border-gray-300 border-t-0"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* TOP HALF: Avatar Hero Section */}
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-b from-secondary/70 via-primary/30 to-secondary/10 pt-6">
        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-white hover:text-white shadow-sm"
            onClick={handleSave}
          >
            <Heart className="w-4 h-4 text-primary" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-white hover:text-white shadow-sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 text-primary" />
          </Button>
        </div>

        <div className="relative">
          <img
            src={`${API_BASE}${creator.avatar}`}
            alt={creator.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = `${avatarPickPlaceholder}`;
            }}
          />
          {creator.isVIP && (
            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full badge-vip flex items-center justify-center shadow-lg border-2 border-background">
              <Crown className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM HALF: Data Section */}
      <div className="flex-1 flex flex-col p-5 pt-2 text-center">
        {/* Identity */}
        <div className="mb-3">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-bold text-lg text-foreground truncate">{creator.name}</h3>
            {/* {creator.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            )} */}
          </div>
          <p className="text-sm text-muted-foreground">@{creator.username}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{creator.location}</span>
          </div>
        </div>

        {/* Bio & Niche */}
        <div className="space-y-3 mb-4 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 px-2 italic">
            "{creator.bio || "No bio available"}"
          </p>
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-4">
              {creator.niche}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 py-4 border-y border-border/50 mb-4">
          <div className="text-center">
            <p className="text-base font-bold text-foreground">{formatFollowers(creator.followers)}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Followers</p>
          </div>
          <div className="text-center border-l">
            <p className="text-base font-bold text-foreground">{formatEngagement(creator.engagementRate)}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Engagement</p>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {creator.platforms?.map((platform) => (
            <div
              key={platform.name}
              className="text-muted-foreground/60 hover:text-primary transition-colors"
              title={`${formatFollowers(platform.followers)} on ${platform.name}`}
            >
              <PlatformIcon platform={platform.name} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              console.log("CLICKED!!!");
              e.stopPropagation();
              onInvite(creator);
            }}
            className='bg-gradient-to-br from-primary/70 via-secondary to-primary/60 text-white hover:text-white hover:scale-105 transition-transform duration-300'
          >
            Invite to Campaign
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Starting at</span>
            <span className="text-lg font-bold text-foreground">
              {creator.priceRange?.split(' - ')[0] || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};