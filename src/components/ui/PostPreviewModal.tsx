import { X, Heart, Eye, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortfolioItem } from "@/types/profile";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

interface PostPreviewModalProps {
  post: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeSuccess?: () => void;
}

export const PostPreviewModal = ({
  post,
  isOpen,
  onClose,
  onLikeSuccess,
}: PostPreviewModalProps) => {
  const [currentPost, setCurrentPost] = useState<PortfolioItem | null>(post);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_BASE = "https://api.influ-link.com";
  const { user } = useUserStore();

  const isOwner =
    user && currentPost && String(user.id) === String(currentPost.profileId);

  const formatStat = (num: number, isViews = false): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(isViews ? 0 : 1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    if (isOpen && post) {
      setCurrentPost(post);
      setLikesCount(Number(post.stats?.likes ?? 0));
      setIsLiked(Boolean(post.hasLiked));
    }
  }, [isOpen, post?.id]);

  // Track view once per open
  useEffect(() => {
    const trackView = async () => {
      if (!currentPost || hasViewed) return;
      try {
        await fetch(
          `${API_BASE_URL}/profiles/${currentPost.profileId}/portfolio/${currentPost.id}/view`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            cache: "no-store",
          }
        );
        setHasViewed(true);
      } catch (err) {
        console.error("Error tracking view:", err);
      }
    };

    if (isOpen) trackView();
    else setHasViewed(false);
  }, [isOpen, currentPost]);

  const handleLike = async () => {
    if (!currentPost) {
      console.warn("No currentPost — aborting like.");
      return;
    }

    const isNowLiked = !isLiked;

    setIsLiked(isNowLiked);
    setLikesCount(prev => (isNowLiked ? prev + 1 : prev - 1));

    try {
      const res = await fetch(
        `${API_BASE_URL}/profiles/${currentPost.profileId}/portfolio/${currentPost.id}/like`,
        {
          method: isNowLiked ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error response:", text);
        throw new Error("Request failed");
      }

      const data = await res.json();

      setLikesCount(data.likes);

      onLikeSuccess?.();

    } catch (err) {
      setIsLiked(!isNowLiked);
      setLikesCount(prev => (isNowLiked ? prev - 1 : prev + 1));
    }
  };

  const confirmDelete = async () => {
    if (!currentPost) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/profiles/${currentPost.profileId}/portfolio/${currentPost.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        }
      );
      if (res.ok) {
        setShowDeleteConfirm(false);
        onClose();
        onLikeSuccess?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentPost) return null;

  return (
    <>
      {/* MAIN PREVIEW */}
      <Dialog open={isOpen} onOpenChange={(val) => !showDeleteConfirm && onClose()}>
        <DialogContent
          className={cn(
            "p-6 border-none gap-0 overflow-hidden flex flex-col",
            "w-full h-[80dvh] lg:h-[90dvh] sm:max-w-3xl sm:rounded-[32px] z-[50]",
            "[&>button]:hidden !z-[50000]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 border-b bg-background shrink-0">
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {currentPost.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] uppercase px-1.5 h-5">
                  {currentPost.type}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-10 w-10 shrink-0"
            >
              <X className="w-12 h-12" />
            </Button>
          </div>

          <div className="flex-1 bg-muted/20 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="relative w-full h-full max-w-[420px] aspect-[9/16] shadow-2xl rounded-2xl overflow-hidden bg-black">
              <img
                src={`${API_BASE}${currentPost.image}`}
                alt={currentPost.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 border-t border-border bg-background shrink-0 pb-10 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-bold text-lg">{currentPost.stats?.views ?? 0}</span>
                  <span className="text-sm text-slate">Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart
                    className={cn(
                      "w-5 h-5",
                      isLiked ? "fill-secondary text-secondary" : "text-muted-foreground"
                    )}
                  />
                  <span className="font-bold text-lg"><span className="font-bold text-lg">
                    {formatStat(likesCount)}
                  </span></span>
                  <span className="text-sm text-slate">Likes</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className="flex-1 sm:flex-none rounded-full px-10 h-11 font-semibold"
                >
                  {isLiked ? "Liked" : "Like"}
                </Button>

                {isOwner && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-11 w-11 shrink-0"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION (Rendered as Sibling to avoid focus traps) */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-[24px] ">
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Delete post?</DialogTitle>
            <DialogDescription className="mt-2">
              Are you sure you want to delete <strong>{currentPost.title}</strong>? This cannot be undone.
            </DialogDescription>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 p-4 bg-muted/30 border-t">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="w-full sm:flex-1 h-12 rounded-xl font-bold"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full sm:flex-1 h-12"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};