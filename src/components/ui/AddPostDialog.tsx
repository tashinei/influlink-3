import { useRef, useState } from "react";
import { X, ImageIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { NewPostData } from "@/types/profile";

interface AddPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: NewPostData) => Promise<boolean>;
}

export const AddPostDialog = ({ isOpen, onClose, onSubmit }: AddPostDialogProps) => {
  const [mobileStep, setMobileStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPost, setNewPost] = useState<NewPostData>({
    title: "",
    brand: "",
    type: "",
    imageFile: null,
    imagePreview: "",
    description: ""
  });

  const resetForm = () => {
    setNewPost({ title: "", brand: "", type: "", imageFile: null, imagePreview: "", description: "" });
    setMobileStep(1);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 200);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingImage(true);
    setTimeout(() => {
      const previewURL = URL.createObjectURL(file);
      setNewPost(prev => ({ ...prev, imageFile: file, imagePreview: previewURL }));
      setIsLoadingImage(false);
    }, 800);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsLoadingImage(true);
    setTimeout(() => {
      const previewURL = URL.createObjectURL(file);
      setNewPost(prev => ({ ...prev, imageFile: file, imagePreview: previewURL }));
      setIsLoadingImage(false);
    }, 800);
  };

  const handleSubmit = async () => {
    if (!newPost.title || !newPost.imageFile) return;

    setIsSubmitting(true);
    const success = await onSubmit(newPost);
    setIsSubmitting(false);

    if (success) {
      handleClose();
    }
  };

  const renderImageUpload = (isMobileView: boolean = false) => (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      onClick={() => !newPost.imagePreview && fileInputRef.current?.click()}
      className={`${isMobileView ? "h-64" : "h-80"} rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center relative transition-all
        ${isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-primary/50"}
        ${newPost.imagePreview ? "p-0 border-solid cursor-default" : "p-6 cursor-pointer"}`}
      role="button"
      tabIndex={newPost.imagePreview ? -1 : 0}
      aria-label="Upload image"
    >
      {isLoadingImage ? (
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Processing image...</p>
        </div>
      ) : newPost.imagePreview ? (
        <div className="relative w-full h-full">
          <img src={newPost.imagePreview} className="w-full h-full object-cover rounded-xl" alt="Preview" />
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              setNewPost({ ...newPost, imageFile: null, imagePreview: "" }); 
            }}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-background p-2 rounded-full transition-colors z-10"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className={`${isMobileView ? "w-10 h-10" : "w-12 h-12"} rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3`}>
            <ImageIcon className={`${isMobileView ? "w-5 h-5" : "w-6 h-6"}`} />
          </div>
          <p className={`${isMobileView ? "text-muted-foreground" : "font-medium text-foreground mb-1"}`}>
            {isMobileView ? "Tap to upload" : "Drop image here or click to upload"}
          </p>
          {!isMobileView && <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>}
        </>
      )}
      {!newPost.imagePreview && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          aria-label="File upload input"
        />
      )}
    </div>
  );

  const renderMobileStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Upload Image</h2>
      {renderImageUpload(true)}
      <Button className="w-full mt-4" disabled={!newPost.imagePreview} onClick={() => setMobileStep(2)}>
        Continue
      </Button>
    </div>
  );

  const renderMobileStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Campaign Title</h2>
      <Input 
        value={newPost.title} 
        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} 
        placeholder="e.g. Summer Collection 2024"
        aria-label="Campaign title"
      />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={() => setMobileStep(1)}>Back</Button>
        <Button className="flex-1" disabled={!newPost.title} onClick={() => setMobileStep(3)}>Next</Button>
      </div>
    </div>
  );

  const renderMobileStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Brand & Type</h2>
      <Input 
        value={newPost.brand} 
        onChange={(e) => setNewPost({ ...newPost, brand: e.target.value })} 
        placeholder="Brand name (optional)"
        aria-label="Brand name"
      />
      <select 
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
        value={newPost.type} 
        onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
        aria-label="Content type"
      >
        <option value="">Select Type...</option>
        <option value="Instagram Reel">Instagram Reel</option>
        <option value="TikTok Video">TikTok Video</option>
        <option value="YouTube Video">YouTube Video</option>
        <option value="Instagram Post">Instagram Post</option>
        <option value="Blog Article">Blog Article</option>
        <option value="UGC">UGC</option>
      </select>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={() => setMobileStep(2)}>Back</Button>
        <Button className="flex-1" onClick={() => setMobileStep(4)}>Next</Button>
      </div>
    </div>
  );

  const renderMobileStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Description</h2>
      <Textarea 
        rows={5} 
        value={newPost.description} 
        onChange={(e) => setNewPost({ ...newPost, description: e.target.value })} 
        placeholder="Short description..."
        aria-label="Campaign description"
      />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={() => setMobileStep(3)}>Back</Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</> : "Publish"}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden max-w-[95vw] sm:max-w-[700px] max-h-[90vh] flex flex-col p-[20px]">
        <div className="px-5 py-4 sm:px-7 sm:py-5 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Work</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Showcase your best collaborations to brands.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isMobile ? (
          <div className="flex-grow overflow-y-auto p-4">
            {mobileStep === 1 && renderMobileStep1()}
            {mobileStep === 2 && renderMobileStep2()}
            {mobileStep === 3 && renderMobileStep3()}
            {mobileStep === 4 && renderMobileStep4()}
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Campaign Image *</Label>
                {renderImageUpload()}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="e.g. Summer Collection 2024"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="brand" className="text-sm font-medium">Brand Name</Label>
                  <Input
                    id="brand"
                    value={newPost.brand}
                    onChange={(e) => setNewPost({ ...newPost, brand: e.target.value })}
                    placeholder="Brand name (optional)"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium">Content Type</Label>
                  <select
                    id="type"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    <option value="Instagram Reel">Instagram Reel</option>
                    <option value="TikTok Video">TikTok Video</option>
                    <option value="YouTube Video">YouTube Video</option>
                    <option value="Instagram Post">Instagram Post</option>
                    <option value="Blog Article">Blog Article</option>
                    <option value="UGC">UGC</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    placeholder="Brief description of the campaign..."
                    className="mt-1.5 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-5 py-3 sm:px-7 sm:py-4 bg-muted/30 border-t flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          {!isMobile && (
            <Button 
              onClick={handleSubmit} 
              disabled={!newPost.title || !newPost.imagePreview || isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</> : "Publish Work"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
