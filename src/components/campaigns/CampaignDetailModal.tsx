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
  Trash2,
  Calendar,
  Target,
  DollarSign,
  Eye,
  Users,
  Building2,
} from "lucide-react";
import { CampaignMediaCarousel } from "./CampaignMediaCarousel";
import { DeleteCampaignConfirmDialog } from "./DeleteCampaignConfirmDialog";
import {
  CampaignData,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
} from "@/types/campaigns";
import { format } from "date-fns";
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils"; // Assuming you use the standard shadcn utility

interface CampaignDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignData;
  onEdit: () => void;
  onPauseResume: () => void;
  onDelete: () => void;
}

const getStatusColor = (status: CampaignData["status"]) => {
  switch (status) {
    case "Active":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "Paused":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "Draft":
      return "bg-muted text-muted-foreground";
    case "Completed":
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
  onDelete,
}: CampaignDetailModalProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const API_BASE = "https://api.influ-link.com";
  const userId = useUserStore((state) => state.user?.id);
  const budgetPercentage = (campaign.budgetSpent / campaign.budget) * 100;
  const remainingBudget = campaign.budget - campaign.budgetSpent;
  const parsedDate = campaign.startDate ? new Date(campaign.startDate) : null;

  const { t } = useTranslation();
  const { token } = useUserStore();

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/campaigns/${userId}/${campaign.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete campaign");
      onDelete();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex flex-col h-[90dvh] w-[95vw] max-w-4xl overflow-hidden z-[50000] p-6">
          {/* HEADER: Sticky/Fixed at top */}
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <DialogTitle className="text-xl font-bold leading-tight">
                  {campaign.name}
                </DialogTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("px-2 py-0", getStatusColor(campaign.status))}>
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-0">
                    {CAMPAIGN_TYPE_LABELS[campaign.type]}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={onEdit} className="h-9">
                  <Pencil className="mr-1.5 h-4 w-4" />
                  {t("mvpCampaignDetails.edit")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  {t("mvpCampaignDetails.delete")}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* TABS CONTAINER: Fills remaining height */}
          <Tabs defaultValue="overview" className="flex flex-col flex-1 overflow-hidden">
            <div className="shrink-0 border-b px-6 bg-card/50">
              <TabsList className="h-12 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-4">
                {["overview", "analytics", "media"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent px-2 h-full data-[state=active]:border-primary data-[state=active]:bg-transparent capitalize"
                  >
                    {t(`mvpCampaignDetails.${tab}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 sm:p-6 space-y-6 pb-20">
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-6 focus-visible:outline-none">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{t("mvpCampaignDetails.title")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t("mvpCampaignDetails.desc")}</p>
                        <p className="mt-1 text-sm leading-relaxed">{campaign.description}</p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t("mvpCampaignDetails.startDate")}</p>
                            <p className="text-sm font-semibold">
                              {parsedDate && !isNaN(parsedDate.getTime()) ? format(parsedDate, "MMM d, yyyy") : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Target className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t("mvpCampaignDetails.primaryGoal")}</p>
                            <p className="text-sm font-semibold">{campaign.primaryGoal}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        {[
                          { label: "platforms", data: campaign.platforms },
                          { label: "niches", data: campaign.niches },
                          { label: "contentTypes", data: campaign.contentTypes },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              {t(`mvpCampaignDetails.${item.label}`)}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.data?.map((val) => (
                                <Badge key={val} variant="secondary" className="text-[11px] font-medium">
                                  {val}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{t("mvpCampaignDetails.budget")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-black">${campaign.budget?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{t("mvpCampaignDetails.totalBudget")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="mt-0 space-y-6 focus-visible:outline-none">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{t("mvpCampaignDetails.budgetTracker")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-muted-foreground">{t("mvpCampaignDetails.budgetSpent")}</span>
                        <span>
                          ${campaign.budgetSpent?.toLocaleString()} / ${campaign.budget?.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={budgetPercentage} className="h-2.5" />
                      <div className="pt-2 flex justify-end">
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">${remainingBudget?.toLocaleString()}</p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                            {t("mvpCampaignDetails.remaining")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 grid-cols-2">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <p className="text-lg font-bold leading-none">{campaign.impressions?.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("mvpCampaignDetails.impressions")}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <p className="text-lg font-bold leading-none">{campaign.reach?.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("mvpCampaignDetails.reach")}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="mt-0 space-y-6 focus-visible:outline-none">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t("mvpCampaignDetails.companyLogo")}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center p-6">
                        {campaign.companyLogo ? (
                          <div className="relative group aspect-square w-40 overflow-hidden rounded-xl border bg-white p-4 shadow-sm">
                            <img
                              src={`${API_BASE}${campaign.companyLogo}`}
                              alt="Logo"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-40 w-40 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30">
                            <Building2 className="mb-2 h-8 w-8 text-muted-foreground/40" />
                            <p className="text-[10px] font-bold text-muted-foreground/60">{t("mvpCampaignDetails.noLogo")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t("mvpCampaignDetails.referenceImages")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CampaignMediaCarousel images={campaign.referenceImages ?? []} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
              </div>
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