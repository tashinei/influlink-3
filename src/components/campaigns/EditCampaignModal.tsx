import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Upload, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  CampaignData,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
} from "@/types/campaigns";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignData;
  onSuccess: () => void;
}

export const EditCampaignModal = ({
  open,
  onOpenChange,
  campaign,
  onSuccess,
}: Props) => {
  const API_BASE = "https://api.influ-link.com";

  /** ---------- FORM STATE ---------- */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [budget, setBudget] = useState<number>(0);
  const [status, setStatus] = useState<CampaignData["status"]>("Open");
  const [type, setType] = useState<CampaignData["type"]>("social");
  const [startDate, setStartDate] = useState<Date | undefined>();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  /** ---------- PREFILL ---------- */
  useEffect(() => {
    if (!campaign) return;

    setName(campaign.name);
    setDescription(campaign.description || "");
    setPrimaryGoal(campaign.primaryGoal || "");
    setBudget(campaign.budget || 0);
    setStatus(campaign.status);
    setType(campaign.type);
    setStartDate(campaign.startDate ? new Date(campaign.startDate) : undefined);
    setExistingImages(campaign.referenceImages || []);
    setRemovedImages([]);
    setReferenceImages([]);
  }, [campaign]);

  const { token } = useUserStore();
  /** ---------- SUBMIT ---------- */
  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("primaryGoal", primaryGoal);
      formData.append("budget", String(budget));
      formData.append("status", status);
      formData.append("type", type);
      if (startDate) formData.append("startDate", startDate.toISOString());
      if (logoFile) formData.append("companyLogo", logoFile);

      removedImages.forEach((path) => formData.append("removedImages[]", path));
      referenceImages.forEach((img) => formData.append("referenceImages", img));

      // Optional: send remaining images so backend knows what to keep
      formData.append("existingImages", JSON.stringify(existingImages));

      const res = await fetch(`${API_BASE}/api/campaigns/${campaign.id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaign) {
      setExistingImages(campaign.referenceImages || []);
    }
  }, [campaign]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-4xl overflow-hidden p-16 z-[50000]">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="budget">Budget & Goals</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          {/* ---------- DETAILS ---------- */}
          <TabsContent value="details" className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as CampaignData["status"])
                  }
                >
                  {Object.entries(CAMPAIGN_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Type</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as CampaignData["type"])
                  }
                >
                  {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                {/* CHANGE: Ensure PopoverContent has a higher z-index than DialogContent 
          and check that your Popover implementation uses <PopoverPortal> 
      */}
                <PopoverContent align="start" className="w-auto p-0 z-[50001]">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </TabsContent>

          {/* ---------- BUDGET ---------- */}
          <TabsContent value="budget" className="space-y-4">
            <div>
              <Label>Primary Goal</Label>
              <Input
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
              />
            </div>

            <div>
              <Label>Total Budget ($)</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </div>

            <Badge variant="outline">
              Spent: ${campaign.budgetSpent?.toLocaleString()}
            </Badge>
          </TabsContent>

          {/* ---------- MEDIA ---------- */}
          <TabsContent value="media" className="space-y-6">
            <div>
              <Label>Company Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label>Reference Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setReferenceImages(Array.from(e.target.files || []))
                }
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {existingImages.map((img) => (
                  <div key={img} className="relative h-20 w-20">
                    <img
                      src={`${API_BASE}${img}`}
                      className="h-full w-full rounded object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setRemovedImages((prev) => [...prev, img]);
                        setExistingImages((prev) =>
                          prev.filter((i) => i !== img)
                        );
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* New uploads */}
                {referenceImages.map((file, idx) => (
                  <div key={file.name + idx} className="relative h-20 w-20">
                    <img
                      src={URL.createObjectURL(file)}
                      className="h-full w-full rounded object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() =>
                        setReferenceImages((prev) =>
                          prev.filter((f) => f !== file)
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
