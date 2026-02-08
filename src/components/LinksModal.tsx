import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  User,
  Search,
  Circle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface Collaborator {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  role: "brand" | "creator";
  status: "active" | "on_hold" | "completed";
  currentCampaign?: string;
}

interface CollaboratorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChat?: (collaborator: Collaborator) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || "https://api.influ-link.com";

export default function LinksModal({ open, onOpenChange, onChat }: CollaboratorsModalProps) {
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;

    const fetchCollaborators = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/links`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load collaborators");
        const data = await res.json();
        setCollaborators(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, [open]);

  const filteredItems = useMemo(() => {
    return collaborators.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collaborators, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* sm:max-w-xl and h-[85vh] on mobile to ensure it feels like a native sheet */}
      <DialogContent className="sm:max-w-xl p-6 overflow-hidden border-none bg-white shadow-2xl h-[90vh] sm:h-auto flex flex-col">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-bold text-black">{t("links.title")}</DialogTitle>
              <DialogDescription className="text-zinc-500">
                {t("links.subtitle")}
              </DialogDescription>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder={t("links.searchBy")}
              className="pl-10 bg-zinc-100 border-none text-black placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 custom-scrollbar">
          <div className="space-y-3">
            {loading ? (
              <CollaboratorSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-xl text-sm border border-red-100">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-sm italic">
                {t("links.noActive")}
              </div>
            ) : (
              filteredItems.map((person) => (
                <div
                  key={person.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-primary via-secondary to-tertiary drop-shadow-xl hover:shadow-lg hover:shadow-black-200 transition-all gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-white/20">
                        <AvatarImage src={`${IMAGE_BASE}${person.avatar}`} />
                        <AvatarFallback className="bg-white/10 text-white">
                          {person.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Circle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-green-400 text-primary border-2 border-white rounded-full" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{person.name}</h4>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase bg-white/20 text-white border-none">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 uppercase bg-white/20 text-white border-none"
                          >
                            {t(`mvpNotifications.${person.role.toLowerCase()}`)}
                          </Badge>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-white/80">
                        <p className="text-xs truncate font-medium">@{person.handle}</p>
                        {person.currentCampaign && (
                          <>
                            <span className="text-[10px] opacity-60">•</span>
                            <span className="text-[10px] italic truncate max-w-[120px]">
                              {person.currentCampaign}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0 ml-auto sm:ml-0 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 shrink-0 p-0 rounded-full text-white hover:bg-white/20 active:scale-95 transition-transform"
                      onClick={() => navigate(`/profile/${person.handle}`)}
                    >
                      <User className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-10 grow sm:grow-0 gap-2 bg-white text-primary hover:bg-zinc-100 rounded-full px-6 active:scale-95 transition-all shadow-md"
                      onClick={() => onChat?.(person)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t("links.chat")}</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollaboratorSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
          <div className="flex items-center gap-4 w-full">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}