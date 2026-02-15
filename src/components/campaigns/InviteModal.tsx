import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Send, Megaphone } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

interface Creator {
  id: string;
  name: string;
  handle?: string;
}

interface Campaign {
  id: number;
  name: string;
  company_logo?: string;
}

interface InviteCreatorModalProps {
  creator: Creator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const InviteModal = ({
  creator,
  open,
  onOpenChange,
}: InviteCreatorModalProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { token } = useUserStore();

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setMessage("");
      setError(null);
      setSendingCampaignId(null);
      return;
    }

    const fetchCampaigns = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }

        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        setError("Failed to load campaigns. Please try again.");
        toast.error("Failed to load campaigns");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCampaigns();
  }, [open]);

  const handleSendInvite = async (campaignId: number) => {
    if (sendingCampaignId) return; // Prevent double submission

    setSendingCampaignId(campaignId);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include",
        body: JSON.stringify({
          creatorId: creator.id,
          campaignId,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send invitation");
      }

      toast.success(`Invitation sent to ${creator.name}!`);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to send invitation:", err);
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
      setSendingCampaignId(null);
    }
  };

  const selectedCampaign = campaigns.find((c) => c.id === sendingCampaignId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 !p-4">
            <Send className="h-5 w-5 text-primary" />
            Invite to Campaign
          </DialogTitle>
          <DialogDescription>
            Send an invitation to <span className="font-medium text-foreground">{creator.name}</span> to collaborate on one of your campaigns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="invite-message">Personal Message (optional)</Label>
            <Textarea
              id="invite-message"
              placeholder="Add a personalized message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500 characters
            </p>
          </div>

          {/* Campaigns List */}
          <div className="space-y-2">
            <Label>Select a Campaign</Label>

            {isFetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    // Re-trigger fetch by toggling open state effect
                    const refetch = async () => {
                      setIsFetching(true);
                      try {
                        const response = await fetch(`${API_BASE_URL}/campaigns`, {
                          credentials: "include",
                          headers: {
                            "Content-Type": "application/json",
                            ...(token && { "Authorization": `Bearer ${token}` })
                          },
                        });
                        if (!response.ok) throw new Error();
                        setCampaigns(await response.json());
                        setError(null);
                      } catch {
                        setError("Failed to load campaigns. Please try again.");
                      } finally {
                        setIsFetching(false);
                      }
                    };
                    refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-6 border rounded-lg border-dashed">
                <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No campaigns available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a campaign first to send invitations
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[200px] rounded-lg border">
                <div className="p-2 space-y-2">
                  {campaigns.map((campaign) => (
                    <Button
                      key={campaign.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      onClick={() => handleSendInvite(campaign.id)}
                      disabled={isLoading}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {campaign.company_logo ? (
                            <img
                              src={`${API_BASE_URL}${campaign.company_logo}`}
                              alt={campaign.name}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          ) : (
                            <Megaphone className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium text-left truncate flex-1">
                          {campaign.name}
                        </span>
                        {sendingCampaignId === campaign.id ? (
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        ) : (
                          <Send className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
