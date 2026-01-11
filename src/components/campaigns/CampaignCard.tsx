import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useImpressionTracker } from "@/hooks/useImpressionTracker";
interface Props {
  campaign: any;
  onApply?: (campaignId: string) => void;
}

export const CampaignCard = ({ campaign, onApply }: Props) => {
  const API_BASE = "http://localhost:3000";
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

  const statusVariant =
    status === "active"
      ? "default"
      : status === "completed"
        ? "secondary"
        : "outline";

  return (
    <Card ref={ref} className="hover:shadow-lg transition rounded-2xl">
      <CardContent className="flex flex-col justify-between h-full p-5 space-y-4">
        {/* Top content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={company_logo ? `${API_BASE}${company_logo}` : "/placeholder-logo.png"}
              alt={name}
              className="h-10 w-10 rounded-lg object-cover border"
            />
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{name}</h3>
              <p className="text-xs text-muted-foreground truncate">{type}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description || "No description provided."}
          </p>

          {/* Niches */}
          {niches.length > 0 && (
            <div className="flex flex-wrap gap-1">
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

          {/* Meta row */}
          <div className="flex items-center justify-between text-sm">
            <Badge variant={statusVariant}>{status}</Badge>
            <span className="font-semibold">${Number(budget || 0).toLocaleString()}</span>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(start_date).toLocaleDateString()}
              </div>
            )}
            {goal && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {goal}
              </div>
            )}
          </div>

          {/* Platforms */}
          {platforms.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {platforms.map((platform: string) => (
                <Badge key={platform} variant="outline" className="text-xs capitalize">
                  {platform}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Apply button at the bottom */}
        {isCreator && (
          <div className="pt-4">
            <button
              disabled={campaign.hasApplied}
              onClick={() => onApply?.(campaign.id)}
              className={`w-full text-sm font-medium rounded-lg py-2 transition
                ${campaign.hasApplied
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
            >
              {campaign.hasApplied ? "Applied" : "Apply to Campaign"}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

