import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CampaignApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: { id: number; name: string };
}

const Steps = [
  { title: "Cover Letter", description: "Introduce yourself and your experience" },
  { title: "Projects / Portfolio", description: "Share relevant work or links" },
  { title: "Deliverables", description: "What will you deliver for this campaign?" },
  { title: "Proposed Price", description: "Optional: add your proposed price" },
  { title: "Review & Submit", description: "Check your application before sending" },
];

export const CampaignApplyDialog: React.FC<CampaignApplyDialogProps> = ({
  open,
  onOpenChange,
  campaign
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [coverLetter, setCoverLetter] = useState("");
  const [projects, setProjects] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");

  const currentStepData = Steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < Steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaignId: campaign.id,
          message: coverLetter,
          deliverables,
          proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      alert("Proposal submitted successfully!");
      onOpenChange(false);
      // reset state
      setCurrentStep(1);
      setCoverLetter("");
      setProjects("");
      setDeliverables("");
      setProposedPrice("");
    } catch (err: any) {
      console.error("Apply failed:", err);
      alert(err.error || "Failed to apply");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <textarea
            placeholder="Write your cover letter..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full h-64 border rounded p-2"
          />
        );
      case 2:
        return (
          <textarea
            placeholder="Add your projects or portfolio links..."
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
            className="w-full h-64 border rounded p-2"
          />
        );
      case 3:
        return (
          <textarea
            placeholder="Describe your deliverables..."
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            className="w-full h-64 border rounded p-2"
          />
        );
      case 4:
        return (
          <input
            type="number"
            placeholder="Proposed Price (optional)"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            className="w-full border rounded p-2"
          />
        );
      case 5:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Review your application</h4>
            <p><strong>Cover Letter:</strong> {coverLetter}</p>
            <p><strong>Projects / Portfolio:</strong> {projects}</p>
            <p><strong>Deliverables:</strong> {deliverables}</p>
            <p><strong>Proposed Price:</strong> {proposedPrice || "N/A"}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[60vw] max-w-[95vw] overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-border">
            <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
              Apply for "{campaign.name}"
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Step {currentStep} of {Steps.length}: {currentStepData?.description}
            </DialogDescription>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-4">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / Steps.length) * 100}%` }}
              />
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col px-8 py-8 overflow-y-auto">
            {renderStepContent()}
          </div>

          <DialogFooter className="px-8 py-6 border-t border-border bg-muted/30 flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              {currentStep > 1 ? <><ArrowLeft className="mr-2 h-4 w-4" /> Back</> : "Cancel"}
            </Button>

            <Button type="submit" onClick={handleNext}>
              {currentStep === Steps.length ? "Submit Proposal" : (
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
