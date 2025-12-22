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
}

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    title: "Media & Branding (Optional)",
    icon: Camera,
    description: "Upload your logo and any creative references.",
  },
];

const CreateCampaignModal = ({ open, onOpenChange }: CreateCampaignModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState<CampaignForm>({
    name: "",
    description: "",
    type: "",
    date: "",
    budget: "",
    goal: "reach",
    companyLogo: null,
    referenceImages: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (key: keyof CampaignForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  // --- NEW: Step Navigation Logic ---
  const handleNext = () => {
    // Basic validation check for required fields on the current step
    if (currentStep === 1 && (!form.name || !form.description || !form.type || !form.date)) {
        alert("Please fill in all required Core Campaign Details before proceeding.");
        return;
    }
    if (currentStep === 2 && (!form.budget || !form.goal)) {
        alert("Please fill in all required Goals and Budget details before proceeding.");
        return;
    }

    if (currentStep < Steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Final campaign data submitted:", {
      ...form,
      companyLogo: form.companyLogo ? form.companyLogo.name : 'No logo uploaded',
      referenceImages: form.referenceImages?.length ? `${form.referenceImages.length} files uploaded` : 'No references uploaded'
    });
    // Close the modal after submission
    onOpenChange(false);
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {/* Company Logo (Optional) */}
                <div className="space-y-3">
                    <Label htmlFor="companyLogo" className="flex items-center gap-2 text-sm font-medium">
                        <Camera className="h-4 w-4 text-primary/70" />
                        Company Logo (PNG/JPG) <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input
                        id="companyLogo"
                        name="companyLogo"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileInputChange(e, 'companyLogo')}
                        className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary"
                    />
                </div>

                {/* Reference Images (Optional) */}
                <div className="space-y-3">
                    <Label htmlFor="referenceImages" className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-primary/70" />
                        Reference Images (Multiple allowed) <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input
                        id="referenceImages"
                        name="referenceImages"
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileInputChange(e, 'referenceImages')}
                        className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary"
                    />
                </div>
            </div>
            
            <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                    * You can upload up to 5 reference images/documents. All fields in this section are optional and can be updated later.
                </p>
            </div>
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
          h-[95vh] w-[60vw] max-w-[95vw] sm:max-w-[90vw] 
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