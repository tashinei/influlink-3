"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Target,
  Users,
  FileText,
  DollarSign,
  Zap,
  Camera,
  Layers,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useCreatorNiches } from "@/data/mockCreators";

// --- 1. UPDATED FORM INTERFACE ---
interface CampaignForm {
  name: string;
  description: string;
  type: string;
  date: string;
  budget: string;
  goal: string;
  companyLogo: File | null;
  referenceImages: File[] | null;
  platforms: string[];
  niches: string[];
  contentTypes: string[];
  country: string;
  language: string[];
}

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Define the steps and their content
const Steps = [
  {
    key: 1,
    title: "Core Campaign Details",
    icon: Layers,
    description: "Define the fundamental aspects of your campaign.",
  },
  {
    key: 2,
    title: "Goals & Budget",
    icon: Zap,
    description: "Set your objectives and allocate the necessary funds.",
  },
  {
    key: 3,
    title: "Targeting & Filters",
    icon: Target,
    description: "Choose platforms, niches, and audience reach.",
  },
  {
    key: 4,
    title: "Media & Branding (Optional)",
    icon: Camera,
    description: "Upload logos and creative references.",
  },
];

type ValidationErrors = Partial<Record<keyof CampaignForm, string>>;

const validateStep = (
  step: number,
  form: CampaignForm
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // STEP 1 — Core details
  if (step === 1) {
    if (!form.name.trim()) errors.name = "Campaign name is required.";
    if (!form.description.trim())
      errors.description = "Description is required.";
    if (!form.type) errors.type = "Campaign type is required.";
    if (!form.date) errors.date = "Start date is required.";
  }

  // STEP 2 — Goals & budget
  if (step === 2) {
    if (!form.goal) errors.goal = "Please select a campaign goal.";
    if (!form.budget || Number(form.budget) <= 0)
      errors.budget = "Budget must be greater than 0.";
  }

  // STEP 3 — Targeting & filters
  if (step === 3) {
    if (form.platforms.length === 0)
      errors.platforms = "Select at least one platform.";

    if (form.niches.length === 0)
      errors.niches = "Select at least one niche.";

    if (form.contentTypes.length === 0)
      errors.contentTypes = "Select at least one content type.";

    if (!form.country)
      errors.country = "Please select a target country.";

    if (form.language.length === 0)
      errors.language = "Select at least one language.";
  }

  return errors;
};

const CreateCampaignModal = ({ open, onOpenChange, onSuccess }: CreateCampaignModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [errors, setErrors] = useState<ValidationErrors>({});

  const [form, setForm] = useState<CampaignForm>({
    name: "",
    description: "",
    type: "",
    date: "",
    budget: "",
    goal: "reach",
    companyLogo: null,
    referenceImages: null,
    platforms: [],
    niches: [],
    contentTypes: [],
    country: "",
    language: [],
  });

  const API_BASE = "http://localhost:3000"
  
  const niches = useCreatorNiches();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (key: keyof CampaignForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof CampaignForm) => {
    const files = e.target.files;
    if (!files) return;

    if (fieldName === 'companyLogo') {
      setForm((prev) => ({ ...prev, [fieldName]: files[0] || null }));
    } else if (fieldName === 'referenceImages') {
      setForm((prev) => ({ ...prev, [fieldName]: Array.from(files) }));
    }
  };

  const handleNext = () => {
    const validationErrors = validateStep(currentStep, form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    if (currentStep < Steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const toggleArrayValue = (key: keyof CampaignForm, value: string) => {
    setForm(prev => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      };
    });

    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("date", form.date);
      formData.append("budget", form.budget);
      formData.append("goal", form.goal);
      formData.append("platforms", JSON.stringify(form.platforms));
      formData.append("niches", JSON.stringify(form.niches));
      formData.append("contentTypes", JSON.stringify(form.contentTypes));
      formData.append("country", form.country);
      formData.append("language", JSON.stringify(form.language));

      // Append files if present
      if (form.companyLogo) {
        formData.append("companyLogo", form.companyLogo);
      }
      if (form.referenceImages && form.referenceImages.length > 0) {
        form.referenceImages.forEach((file, idx) => {
          formData.append("referenceImages", file);
        });
      }

      const res = await fetch(`${API_BASE}/api/campaigns/create`, {
        method: "POST",
        body: formData,
        credentials: "include", // if using cookies for auth
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create campaign");
      }

      const data = await res.json();
      onSuccess();

      // Close modal and optionally reset form
      onOpenChange(false);
      setForm({
        name: "",
        description: "",
        type: "",
        date: "",
        budget: "",
        goal: "reach",
        companyLogo: null,
        referenceImages: null,
        platforms: [],
        niches: [],
        contentTypes: [],
        country: "",
        language: [],
      });
    } catch (err: any) {
      console.error("Error submitting campaign:", err);
    }
  };

  const currentStepData = Steps.find(step => step.key === currentStep);

  // --- RENDER FUNCTIONS FOR EACH STEP ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-primary/70" />
                Campaign Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Summer Sale 2024"
                className="h-11"
                value={form.name}
                onChange={handleInputChange}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>)}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary/70" />
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your campaign goals and target audience..."
                className="min-h-[120px] resize-none"
                value={form.description}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Type & Date Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary/70" />
                  Campaign Type
                </Label>
                <Select value={form.type} onValueChange={(v) => handleSelectChange("type", v)} required>
                  <SelectTrigger id="type" className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="ads">Paid Ads</SelectItem>
                    <SelectItem value="content">Content Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  Start Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  className="h-11"
                  value={form.date}
                  onChange={handleInputChange}
                  required
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Goal Field */}
            <div className="space-y-3">
              <Label htmlFor="goal" className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-primary/70" />
                Primary Goal
              </Label>
              <Select value={form.goal} onValueChange={(v) => handleSelectChange("goal", v)} required>
                <SelectTrigger id="goal" className="h-11">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reach">Reach/Impressions</SelectItem>
                  <SelectItem value="conversions">Conversions/Sales</SelectItem>
                  <SelectItem value="engagement">Engagement/Likes</SelectItem>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Field */}
            <div className="space-y-3">
              <Label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-primary/70" />
                Total Budget ($)
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                placeholder="e.g., 5000"
                className="h-11"
                value={form.budget}
                onChange={handleInputChange}
                required
              />
              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* LEFT COLUMN */}
            <div className="space-y-8">
              <h4 className="text-lg font-semibold">Platforms & Niches</h4>

              {/* Platforms */}
              <div className="space-y-2">
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {["Instagram", "TikTok", "YouTube", "X"].map(p => (
                    <Button
                      key={p}
                      size="sm"
                      type="button"
                      variant={form.platforms.includes(p) ? "default" : "outline"}
                      onClick={() => toggleArrayValue("platforms", p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                {errors.platforms && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.platforms}
                  </p>
                )}
              </div>

              {/* Niches */}
              <div className="space-y-2">
                <Label>Niches</Label>
                <div className="flex flex-wrap gap-2 max-h-[20vh] overflow-y-scroll">
                  {niches.map(n => (
                    <Button
                      key={n}
                      size="sm"
                      type="button"
                      variant={form.niches.includes(n) ? "default" : "outline"}
                      onClick={() => toggleArrayValue("niches", n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
                {errors.niches && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.niches}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
              <h4 className="text-lg font-semibold">Audience & Content</h4>

              {/* Content Types */}
              <div className="space-y-2">
                <Label>Content Types</Label>
                <div className="flex flex-wrap gap-2">
                  {["Post", "Story", "Reel", "Video", "Livestream"].map(c => (
                    <Button
                      key={c}
                      size="sm"
                      type="button"
                      variant={form.contentTypes.includes(c) ? "default" : "outline"}
                      onClick={() => toggleArrayValue("contentTypes", c)}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
                {errors.contentTypes && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.contentTypes}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2 max-w-sm">
                <Label>Target Country</Label>
                <Select
                  value={form.country ?? ""}
                  onValueChange={(v) => {
                    setForm(prev => ({ ...prev, country: v }));
                    setErrors(prev => ({ ...prev, country: undefined }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="BG">Bulgaria</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {["English", "German", "French", "Spanish", "Bulgarian"].map(l => (
                    <Button
                      key={l}
                      size="sm"
                      type="button"
                      variant={form.language.includes(l) ? "default" : "outline"}
                      onClick={() => toggleArrayValue("language", l)}
                    >
                      {l}
                    </Button>
                  ))}
                </div>
                {errors.language && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.language}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 max-w-xl">

            <div className="space-y-3">
              <Label>Company Logo (Optional)</Label>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => handleFileInputChange(e, "companyLogo")}
              />
              {errors.companyLogo && (
                <p className="text-sm text-red-500">{errors.companyLogo}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Reference Images (Optional)</Label>
              <Input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg"
                onChange={(e) => handleFileInputChange(e, "referenceImages")}
              />
              {errors.referenceImages && (
                <p className="text-sm text-red-500">{errors.referenceImages}</p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Upload visuals to help creators understand your brand style.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          h-[98vh] w-[60vw] max-w-[95vw] sm:max-w-[90vw] 
          overflow-y-auto p-0
        "
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-border">
            <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
              {currentStepData?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Step {currentStep} of {Steps.length}: {currentStepData?.description}
            </DialogDescription>
            {/* Simple Step Indicator */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-4">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / Steps.length) * 100}%` }}
              />
            </div>
          </DialogHeader>

          {/* Form Content */}
          {/* Note: We no longer wrap the whole thing in <form> to manage submission manually by step */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 px-8 py-8 space-y-8 overflow-y-auto">
              {renderStepContent()}
            </div>
          </div>

          {/* Footer - Navigation Buttons */}
          <DialogFooter className="px-8 py-6 border-t border-border bg-muted/30 flex justify-between">

            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              onClick={currentStep > 1 ? handleBack : () => onOpenChange(false)}
            >
              {currentStep > 1 ? (
                <><ArrowLeft className="mr-2 h-4 w-4" /> Back</>
              ) : (
                "Cancel"
              )}
            </Button>

            {/* Next/Submit Button */}
            <Button
              type="submit"
              onClick={handleNext}
            >
              {currentStep === Steps.length ? (
                "Create Campaign"
              ) : (
                <span className="flex items-center">
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;