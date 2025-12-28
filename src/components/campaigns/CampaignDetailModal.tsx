import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Pause,
  Play,
  Trash2,
  Calendar,
  Target,
  DollarSign,
  Eye,
  Users,
  Building2,
  ImageIcon,
} from "lucide-react";
import { CampaignMediaCarousel } from "./CampaignMediaCarousel";
import { DeleteCampaignConfirmDialog } from "./DeleteCampaignConfirmDialog";
import {
  CampaignData,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
} from "@/types/campaigns";
import { format } from "date-fns";
import { profile } from "console";
import { useUserStore } from "@/store/useUserStore";

interface CampaignDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignData;
  onEdit: () => void;
  onPauseResume: () => void;
  onDelete: () => void;
}

const getStatusVariant = (status: CampaignData["status"]) => {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "draft":
      return "outline";
    case "completed":
      return "default";
    default:
      return "default";
  }
};

const getStatusColor = (status: CampaignData["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "paused":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "draft":
      return "bg-muted text-muted-foreground";
    case "completed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    default:
      return "";
  }
};

export const CampaignDetailModal = ({
  open,
  onOpenChange,
  campaign,
  onEdit,
  onPauseResume,
  onDelete,
}: CampaignDetailModalProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const API_BASE = "http://localhost:3000";
  const userId = useUserStore((state) => state.user?.id);
  const budgetPercentage = (campaign.budgetSpent / campaign.budget) * 100;
  const remainingBudget = campaign.budget - campaign.budgetSpent;
  const parsedDate = campaign.startDate ? new Date(campaign.startDate) : null;

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/campaigns/${userId}/${campaign.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete campaign");
      }

      onDelete(); // Refresh list or close modal
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[100dvh] w-[95vw] max-w-4xl overflow-hidden p-8 pb-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-xl font-semibold">
                  {campaign.name}
                </DialogTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                  </Badge>
                  <Badge variant="outline">
                    {CAMPAIGN_TYPE_LABELS[campaign.type]}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                {campaign.status !== "completed" &&
                  campaign.status !== "draft" && (
                    <Button variant="outline" size="sm" onClick={onPauseResume}>
                      {campaign.status === "paused" ? (
                        <>
                          <Play className="mr-1.5 h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="mr-1.5 h-4 w-4" />
                          Pause
                        </>
                      )}
                    </Button>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1">
            <div className="border-b px-6">
              <TabsList className="h-12 w-full justify-start rounded-none border-0 bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Media
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="max-h-[calc(95vh-180px)] overflow-y-auto p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Description
                      </p>
                      <p className="mt-1 text-sm">{campaign.description}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Start Date
                          </p>
                          <p className="text-sm font-medium">
                            <p className="text-sm font-medium">
                              {parsedDate && !isNaN(parsedDate.getTime())
                                ? format(parsedDate, "MMM d, yyyy")
                                : "N/A"}
                            </p>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <Target className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Primary Goal
                          </p>
                          <p className="text-sm font-medium">
                            {campaign.primaryGoal}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Budget Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          ${campaign.budget?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total Budget
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Budget Tracker</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Budget Spent
                      </span>
                      <span className="font-medium">
                        ${campaign.budgetSpent?.toLocaleString()} of $
                        {campaign.budget?.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={budgetPercentage} className="h-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">
                          Spent
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          ${remainingBudget?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Remaining
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {campaign.impressions?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Impressions
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {campaign.reach?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Reach</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Logo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    {campaign.companyLogo ? (
                      <div className="flex h-52 w-52 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={`${API_BASE}${campaign.companyLogo}`}
                          alt="Company logo"
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-32 flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
                        <Building2 className="mb-1 h-8 w-8 text-muted-foreground/50" />
                        <p className="text-xs text-muted-foreground">No logo</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Reference Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CampaignMediaCarousel
                      images={campaign.referenceImages ?? []}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DeleteCampaignConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        campaignName={campaign.name}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
};
