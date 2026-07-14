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
  AlertCircle,
  CreditCard,
  SendHorizonal,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  role: "brand" | "creator";
  status: "active" | "on_hold" | "completed";
  currentCampaign?: string;
  campaignId?: string;
  proposedPrice?: number | null;
  campaignBudget?: number | null;     // ← fallback deal price for invites (campaign budget)
  dealPaymentId?: string | null;      // ← add
  paymentStatus?: string | null;      // ← add
  creatorPayout?: number | null;      // ← add
  creatorMarkedDone?: boolean;        // ← creator marked the work finished
  brandApproved?: boolean;            // ← brand approved the release
}

interface CollaboratorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChat?: (collaborator: Collaborator) => void;
  accountType: "creator" | "brand";
  onPayBegin?: (collaborator: Collaborator) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || "https://api.influ-link.com";

export default function LinksModal({ open, onOpenChange, onChat, accountType, onPayBegin }: CollaboratorsModalProps) {
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useUserStore();

  useEffect(() => {
    if (!open) return;

    const fetchCollaborators = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/links`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
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
    return collaborators.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collaborators, searchQuery]);

  const handlePayClick = (person: Collaborator) => {
    onPayBegin?.(person);
  };

  const [isReleasing, setIsReleasing] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Brand: approve the deal. Funds only leave escrow once the creator has also
  // marked the campaign finished — the backend returns `released` to tell us.
  const handleRelease = async (person: Collaborator) => {
    if (!person.dealPaymentId) return;
    setIsReleasing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/release`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealPaymentId: person.dealPaymentId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Update local state so button changes immediately
      setCollaborators(prev =>
        prev.map(c =>
          c.dealPaymentId === person.dealPaymentId
            ? {
                ...c,
                brandApproved: true,
                paymentStatus: data.released ? "transferred" : c.paymentStatus,
              }
            : c
        )
      );
      toast.success(
        data.released
          ? "Funds released to creator!"
          : "Approved. Funds release once the creator marks the campaign finished."
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to release funds");
    } finally {
      setIsReleasing(false);
    }
  };

  // Creator: mark the campaign finished. Funds release automatically if the
  // brand has already approved; otherwise we wait for their approval.
  const handleMarkFinished = async (person: Collaborator) => {
    if (!person.dealPaymentId) return;
    setIsFinishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/creator-finished`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealPaymentId: person.dealPaymentId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCollaborators(prev =>
        prev.map(c =>
          c.dealPaymentId === person.dealPaymentId
            ? {
                ...c,
                creatorMarkedDone: true,
                paymentStatus: data.released ? "transferred" : c.paymentStatus,
              }
            : c
        )
      );
      toast.success(
        data.released
          ? "Campaign finished — funds released to you!"
          : "Marked as finished. Awaiting brand approval."
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as finished");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleRequestPayment = async (person: Collaborator) => {
    // Send a chat message with a payment request
    onOpenChange(false);
    onChat?.({
      ...person,
      // Flag so chat knows to pre-fill a payment request message
      _paymentRequest: true,
    } as any);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl p-6 overflow-hidden border-none bg-white shadow-2xl h-[80dvh] lg-h-[90dvh] sm:h-auto flex flex-col z-[50000]">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-xl font-bold text-black">
                  {t("links.title")}
                </DialogTitle>
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
                filteredItems.map((person, index) => (
                  <div
                    key={`${person.id}-${person.campaignId}-${index}`}
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

                      <div className="min-w-0 flex flex-col gap-1">
                        {/* Top row: name + badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white truncate">
                            {person.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 uppercase bg-white/20 text-white border-none shrink-0"
                          >
                            {t(`mvpNotifications.${person.role.toLowerCase()}`)}
                          </Badge>
                          {person.proposedPrice && (
                            <span className="text-[10px] bg-white/30 text-white rounded-full px-2 py-0.5 font-bold shrink-0">
                              ${Number(person.proposedPrice).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Bottom row: handle + campaign */}
                        <div className="flex items-center gap-1.5 text-white/70">
                          <p className="text-xs font-medium shrink-0">@{person.handle}</p>
                          {person.currentCampaign && (
                            <>
                              <span className="text-[10px] opacity-60">•</span>
                              <span className="text-xs italic truncate text-white/90 font-semibold">
                                {person.currentCampaign}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:shrink-0 ml-auto sm:ml-0 w-full sm:w-auto flex-wrap">
                      {/* Profile button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 shrink-0 p-0 rounded-full text-white hover:bg-white/20 active:scale-95 transition-transform"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/profile/${person.handle}`);
                        }}
                      >
                        <User className="h-5 w-5" />
                      </Button>

                      {/* Chat button */}
                      <Button
                        size="sm"
                        className="h-10 gap-2 bg-white text-primary hover:bg-zinc-100 rounded-full px-4 active:scale-95 transition-all shadow-md"
                        onClick={() => {
                          onOpenChange(false);
                          onChat?.(person);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {t("links.chat")}
                        </span>
                      </Button>

                      {/* Brand: Pay & Begin → Approve & Release */}
                      {accountType === "brand" && (
                        <>
                          {person.paymentStatus === "transferred" ? (
                            // Already released
                            <span className="flex items-center gap-1.5 bg-white border text-secondary rounded-full px-4 h-10 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                              <span className="text-[12px] font-bold tracking-wide">FUNDS RELEASED</span>
                            </span>
                          ) : person.paymentStatus === "paid" ? (
                            person.brandApproved && !person.creatorMarkedDone ? (
                              // Brand approved, but creator hasn't finished yet
                              <span className="flex items-center gap-1.5 bg-white/85 text-secondary rounded-full px-4 h-10 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold tracking-wide uppercase">Waiting for creator</span>
                              </span>
                            ) : (
                              // Funds held in escrow — approve to release (releases now if creator already finished)
                              <Button
                                size="sm"
                                className="h-10 gap-2 bg-green-500 text-white hover:bg-green-600 rounded-full px-4 active:scale-95 transition-all shadow-md font-bold"
                                onClick={() => handleRelease(person)}
                                disabled={isReleasing}
                              >
                                <CreditCard className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {isReleasing ? "Approving..." : "Approve & Release"}
                                </span>
                              </Button>
                            )
                          ) : (
                            // No payment yet
                            <Button
                              size="sm"
                              className="h-10 gap-2 bg-white/90 text-[#635BFF] hover:bg-white rounded-full px-4 active:scale-95 transition-all shadow-md font-bold"
                              onClick={() => handlePayClick(person)}
                            >
                              <CreditCard className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Pay & Begin
                              </span>
                            </Button>
                          )}
                        </>
                      )}

                      {/* Creator: Request → Mark Finished → Paid */}
                      {accountType === "creator" && (
                        <>
                          {person.paymentStatus === "transferred" ? (
                            // Funds received
                            <span className="flex items-center gap-1.5 bg-white border text-secondary rounded-full px-4 h-10 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                              <span className="text-[12px] font-bold tracking-wide">PAID</span>
                            </span>
                          ) : person.paymentStatus === "paid" ? (
                            person.creatorMarkedDone ? (
                              // Finished, waiting on brand approval
                              <span className="flex items-center gap-1.5 bg-white/85 text-secondary rounded-full px-4 h-10 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold tracking-wide uppercase">Awaiting brand</span>
                              </span>
                            ) : (
                              // Funded and held in escrow — mark the work finished
                              <Button
                                size="sm"
                                className="h-10 gap-2 bg-green-500 text-white hover:bg-green-600 rounded-full px-4 active:scale-95 transition-all shadow-md font-bold"
                                onClick={() => handleMarkFinished(person)}
                                disabled={isFinishing}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {isFinishing ? "Saving..." : "Mark Finished"}
                                </span>
                              </Button>
                            )
                          ) : (
                            // No payment yet — nudge the brand
                            <Button
                              size="sm"
                              className="h-10 gap-2 bg-white/20 text-white hover:bg-white/30 border border-white/30 rounded-full px-4 active:scale-95 transition-all shadow-md"
                              onClick={() => handleRequestPayment(person)}
                            >
                              <CreditCard className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Request
                              </span>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CollaboratorSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100"
        >
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