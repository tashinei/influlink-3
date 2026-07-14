import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Target,
  DollarSign,
  Building2,
  Share2,
  Bookmark,
  Instagram,
  Youtube,
  Twitter,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useImpressionTracker } from "@/hooks/useImpressionTracker";
import { toast } from "sonner";
import { BsFacebook, BsInstagram, BsX, BsYoutube } from "react-icons/bs";

interface Props {
  campaign: any;
  onApply?: (campaignId: string) => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <BsInstagram className="h-4 w-4" />;
    case 'youtube':
      return <BsYoutube className="h-4 w-4" />;
    case 'twitter':
      return <BsX className="h-4 w-4" />;
    case 'facebook':
      return <BsFacebook className="h-4 w-4" />;
    case 'tiktok':
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    default:
      return null;
  }
};

export const CampaignCard = ({ campaign, onApply }: Props) => {
  const API_BASE = "https://api.influ-link.com";
  const isCreator = useUserStore((state) => state.accountType === "creator");
  const {
    name,
    description,
    status,
    budget,
    niches = [],
    platforms = [],
    start_date,
    goal,
    company_logo,
    type,
  } = campaign;

  const ref = useImpressionTracker({ campaignId: campaign.id });

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Campaign saved!`, {
      className: "bg-gradient-to-br from-secondary to-primary/85",
      style: { color: 'white' },
      icon: <Bookmark className="h-4 w-4 fill-current" />,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://influ-link.com/campaigns/${campaign.id}`);
    toast.success('Campaign link copied!', {
      className: "bg-gradient-to-br from-secondary to-primary/85",
      style: { color: 'white' },
      icon: <Share2 className="h-4 w-4" />,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      case 'draft':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      ref={ref}
      className="group relative flex h-[480px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* TOP HALF: Logo Hero Section */}
      <div className="relative h-40 bg-gradient-to-b from-secondary/70 via-primary/30 to-secondary/10">
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${getStatusColor(status)} border capitalize`}>
            {status || 'Draft'}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleSave}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Company Logo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="relative">
            <div className="h-28 w-28 rounded-xl border-4 border-background bg-card shadow-lg flex items-center justify-center overflow-hidden">
              {company_logo ? (
                <img
                  src={`${API_BASE}${company_logo}`}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="h-14 w-14 text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>';
                  }}
                />
              ) : (
                <Building2 className="h-14 w-14 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HALF: Data Section */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-16">
        {/* Identity */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-foreground line-clamp-1">{name}</h3>
          {type && (
            <p className="text-sm text-muted-foreground capitalize">{type}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground text-center italic line-clamp-2">
            "{description || "No description provided."}"
          </p>
        </div>

        {/* Niches */}
        {niches.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-3">
            {niches.slice(0, 3).map((niche: string) => (
              <Badge key={niche} variant="secondary" className="text-xs">
                {niche}
              </Badge>
            ))}
            {niches.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{niches.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">
              ${Number(budget || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Budget</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {start_date ? new Date(start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
            </p>
            <p className="text-xs text-muted-foreground">Start Date</p>
          </div>
        </div>

        {/* Goal */}
        {goal && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
            <Target className="h-3 w-3" />
            <span className="line-clamp-1">{goal}</span>
          </div>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="flex justify-center gap-2 mb-4">
            {platforms.map((platform: string) => (
              <div key={platform} className="p-1.5 rounded-full bg-muted text-muted-foreground">
                <PlatformIcon platform={platform} />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {isCreator && (
          <Button
            variant={campaign.hasApplied ? "secondary" : "default"}
            className="w-full bg-gradient-to-br from-tertiary via-secondary to-primary"
            disabled={campaign.hasApplied}
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(campaign.id);
            }}
          >
            {campaign.hasApplied ? "Applied" : "Apply to Campaign"}
          </Button>
        )}
      </div>
    </div>
  );
};
