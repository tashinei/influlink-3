import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Link as LinkIcon,
  ArrowRight,
  CheckCircle2,
  Building2,
  User,
  DollarSign,
  Calendar,
  MessageSquare,
  Inbox,
  Briefcase,
} from "lucide-react";

// Matches the new unified backend object
interface InfluLink {
  id: string;
  campaignId: string;
  title: string;
  status: string;
  category: string;
  date: string;
  linkType: "campaign" | "proposal" | "invitation" | "deal";
  logo?: string;
  budget: number;
  type: string;
}

interface LinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountType: "brand" | "creator" | null;
  onSelectLink?: (link: InfluLink) => void; // Optional callback to send to chat
}

const API_BASE_URL = "http://localhost:3000/api";
const API_BASE = "http://localhost:3000";

export default function LinksModal({ open, onOpenChange, accountType, onSelectLink }: LinksModalProps) {
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<InfluLink[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/links`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch available links");
        const data = await res.json();
        setLinks(data);
      } catch (err: any) {
        console.error("Failed to fetch links:", err);
        setError(err.message || "Failed to load links");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [open]);

  const handleShareLink = (link: InfluLink) => {
    if (onSelectLink) {
      onSelectLink(link);
    } else {
      console.log("Selected Link:", link);
    }
    onOpenChange(false);
  };

  const isEmpty = !loading && links.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md !p-10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div> */}
            <div>
              <DialogTitle className="text-lg">Links</DialogTitle>
              <DialogDescription className="text-sm">
                Share a campaign or deal in this chat
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2">
          <div className="mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Available to Share</h3>
            {!loading && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {links.length}
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty & Error States omitted for brevity - keep your existing ones! */}

          {/* Unified Links List */}
          {!loading && !error && links.length > 0 && (
            <div className="max-h-[70%] space-y-2 overflow-y-auto pr-1">
              {links.map((link) => (
                <Card
                  key={`${link.linkType}-${link.id}`}
                  className="group cursor-pointer p-3 transition-all hover:border-primary/50 hover:bg-accent/50"
                  onClick={() => handleShareLink(link)}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual: Logo or Icon */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                      {link.logo ? (
                        <img
                          src={`${API_BASE}${link.logo}`}
                          alt={link.title}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {link.title}
                        </span>
                        {link.status === "accepted" || link.linkType === "deal" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                        ) : null}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-medium text-primary/80">{link.category}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3" />
                          {Number(link.budget).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[80px]">{link.type}</span>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground opacity-70">
                    <Calendar className="h-3 w-3" />
                    {link.date}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}