import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/useUserStore";

interface CampaignApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: { id: number; name: string };
}

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

interface FormData {
  coverLetter: string;
  projects: string;
  deliverables: string;
  proposedPrice: string;
}

interface FormErrors {
  coverLetter?: string;
  projects?: string;
  deliverables?: string;
  proposedPrice?: string;
}

const STEPS = [
  {
    id: 1,
    title: "Cover Letter",
    description: "Introduce yourself and your experience",
    field: "coverLetter" as const,
    maxLength: 2000,
    required: true,
    minLength: 20
  },
  {
    id: 2,
    title: "Portfolio",
    description: "Share relevant work or links",
    field: "projects" as const,
    maxLength: 1500,
    required: false
  },
  {
    id: 3,
    title: "Deliverables",
    description: "What will you deliver for this campaign?",
    field: "deliverables" as const,
    maxLength: 1000,
    required: false
  },
  {
    id: 4,
    title: "Price",
    description: "Optional: add your proposed price",
    field: "proposedPrice" as const,
    required: false
  },
  {
    id: 5,
    title: "Review",
    description: "Check your application before sending",
    field: null,
    required: false
  },
];

const DRAFT_STORAGE_KEY = "campaign_apply_draft";

export const CampaignApplyDialog: React.FC<CampaignApplyDialogProps> = ({
  open,
  onOpenChange,
  campaign,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    coverLetter: "",
    projects: "",
    deliverables: "",
    proposedPrice: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStepData = STEPS[currentStep - 1];

  // Load draft from localStorage
  useEffect(() => {
    if (open && !draftRestored) {
      const savedDraft = localStorage.getItem(`${DRAFT_STORAGE_KEY}_${campaign.id}`);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.formData) {
            setFormData(parsed.formData);
            setDraftRestored(true);
            toast({
              title: "Draft restored",
              description: "Your previous progress has been restored.",
            });
          }
        } catch (e) {
          console.error("Failed to parse draft:", e);
        }
      }
    }
  }, [open, campaign.id, draftRestored, toast]);

  // Auto-save draft
  const saveDraft = useCallback(() => {
    const draft = {
      formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${DRAFT_STORAGE_KEY}_${campaign.id}`, JSON.stringify(draft));
    setLastSaved(new Date());
  }, [formData, campaign.id]);

  useEffect(() => {
    if (open && (formData.coverLetter || formData.projects || formData.deliverables || formData.proposedPrice)) {
      const timer = setTimeout(saveDraft, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, open, saveDraft]);

  // Clear draft on successful submission
  const clearDraft = () => {
    localStorage.removeItem(`${DRAFT_STORAGE_KEY}_${campaign.id}`);
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Don't clear form data - keep draft
      setCurrentStep(1);
      setErrors({});
      setDraftRestored(false);
    }
    onOpenChange(newOpen);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const stepData = STEPS[step - 1];
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (formData.coverLetter.trim().length < 20) {
        newErrors.coverLetter = "Cover letter must be at least 20 characters";
      } else if (formData.coverLetter.length > 2000) {
        newErrors.coverLetter = "Cover letter exceeds maximum length";
      }
    }

    if (step === 4 && formData.proposedPrice) {
      const price = Number(formData.proposedPrice);
      if (isNaN(price) || price < 0) {
        newErrors.proposedPrice = "Please enter a valid positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepClick = (stepNumber: number) => {
    // Only allow going back or to completed steps
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else {
      handleOpenChange(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isPdf) {
        toast({
          title: "Invalid file type",
          description: "Only images and PDFs are allowed",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Files must be under 10MB",
          variant: "destructive",
        });
        return;
      }

      const attachedFile: AttachedFile = {
        id: crypto.randomUUID(),
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
      };
      newFiles.push(attachedFile);
    });

    setAttachedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);

    const fullMessage = `
${formData.coverLetter.trim()}`;

    try {
      const res = await fetch(`${API_BASE_URL}/proposals`, {
        method: "POST",
         headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          campaignId: campaign.id,
          message: fullMessage,
          deliverables: formData.deliverables.trim() || null,
          proposedPrice: formData.proposedPrice ? Number(formData.proposedPrice) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      toast({
        title: "Proposal submitted!",
        description: "Your application has been sent successfully.",
      });

      clearDraft();
      handleOpenChange(false);
      setFormData({
        coverLetter: "",
        projects: "",
        deliverables: "",
        proposedPrice: "",
      });
      setAttachedFiles([]);
      setCurrentStep(1);
    } catch (err: unknown) {
      console.error("Apply failed:", err);
      const errorMessage = err && typeof err === 'object' && 'error' in err
        ? String((err as { error: unknown }).error)
        : "Failed to submit proposal";
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCharacterCountColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 1) return "text-destructive";
    if (ratio > 0.9) return "text-yellow-600 dark:text-yellow-500";
    return "text-muted-foreground";
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between w-full px-2">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isClickable = step.id < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isCompleted && "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
                  isCurrent && "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                  isClickable && "cursor-pointer"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.id}
              </button>
              <span className={cn(
                "text-xs font-medium text-center hidden sm:block",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2",
                isCompleted ? "bg-primary" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="coverLetter" className="text-base font-medium">
                Cover Letter <span className="text-destructive">*</span>
              </Label>
              <span className={cn(
                "text-xs",
                getCharacterCountColor(formData.coverLetter.length, 2000)
              )}>
                {formData.coverLetter.length} / 2,000
              </span>
            </div>
            <Textarea
              id="coverLetter"
              placeholder="Introduce yourself, highlight your relevant experience, and explain why you're the perfect fit for this campaign..."
              value={formData.coverLetter}
              onChange={(e) => updateFormData("coverLetter", e.target.value)}
              className={cn(
                "min-h-[280px] resize-none",
                errors.coverLetter && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.coverLetter && (
              <p className="text-sm text-destructive">{errors.coverLetter}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="projects" className="text-base font-medium">
                  Projects & Links
                </Label>
                <span className={cn(
                  "text-xs",
                  getCharacterCountColor(formData.projects.length, 1500)
                )}>
                  {formData.projects.length} / 1,500
                </span>
              </div>
              <Textarea
                id="projects"
                placeholder="Share links to your portfolio, previous work, social media profiles, or any relevant projects..."
                value={formData.projects}
                onChange={(e) => updateFormData("projects", e.target.value)}
                className="min-h-[160px] resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">File Attachments</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-accent/50"
                )}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload files</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Images and PDFs up to 10MB each
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {attachedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {attachedFiles.map(file => (
                    <div
                      key={file.id}
                      className="relative group rounded-lg border bg-card p-2"
                    >
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="aspect-square rounded bg-muted flex items-center justify-center overflow-hidden">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs truncate mt-1.5 text-muted-foreground">
                        {file.file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="deliverables" className="text-base font-medium">
                Deliverables
              </Label>
              <span className={cn(
                "text-xs",
                getCharacterCountColor(formData.deliverables.length, 1000)
              )}>
                {formData.deliverables.length} / 1,000
              </span>
            </div>
            <Textarea
              id="deliverables"
              placeholder="Describe what you will deliver for this campaign. Include specifics like number of posts, content type, timeline, etc..."
              value={formData.deliverables}
              onChange={(e) => updateFormData("deliverables", e.target.value)}
              className="min-h-[280px] resize-none"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <Label htmlFor="proposedPrice" className="text-base font-medium">
              Proposed Price (Optional)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="proposedPrice"
                type="number"
                placeholder="0.00"
                value={formData.proposedPrice}
                onChange={(e) => updateFormData("proposedPrice", e.target.value)}
                className={cn(
                  "pl-7",
                  errors.proposedPrice && "border-destructive focus-visible:ring-destructive"
                )}
                min="0"
                step="0.01"
              />
            </div>
            {errors.proposedPrice && (
              <p className="text-sm text-destructive">{errors.proposedPrice}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave blank if you prefer to negotiate or accept the brand's offer.
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Cover Letter</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="h-7 text-xs"
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {formData.coverLetter || "Not provided"}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Portfolio</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="h-7 text-xs"
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {formData.projects || "Not provided"}
                </p>
                {attachedFiles.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {attachedFiles.map(file => (
                      <div key={file.id} className="flex items-center gap-1.5 text-xs bg-muted rounded px-2 py-1">
                        {file.preview ? (
                          <ImageIcon className="h-3 w-3" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        <span className="truncate max-w-[100px]">{file.file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Deliverables</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="h-7 text-xs"
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {formData.deliverables || "Not provided"}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Proposed Price</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(4)}
                    className="h-7 text-xs"
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.proposedPrice ? `$${Number(formData.proposedPrice).toLocaleString()}` : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="h-[90vh] w-full max-w-2xl overflow-hidden p-6 gap-0 flex flex-col z-[50001]">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b space-y-4">
          <div>
            <DialogTitle className="text-xl font-semibold">
              Apply for "{campaign.name}"
            </DialogTitle>
            <DialogDescription className="mt-1">
              {currentStepData.description}
            </DialogDescription>
          </div>
          {renderStepIndicator()}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 px-6 py-6 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                {currentStep > 1 ? (
                  <>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </>
                ) : (
                  "Cancel"
                )}
              </Button>
              {lastSaved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  Draft saved
                </span>
              )}
            </div>

            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentStep === STEPS.length ? (
                "Submit Proposal"
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

