import { X, Heart, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortfolioItem } from "@/types/profile";
import { useState, useEffect } from "react";

interface PostPreviewModalProps {
  post: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeSuccess?: () => void;
}

export const PostPreviewModal = ({ post, isOpen, onClose, onLikeSuccess }: PostPreviewModalProps) => {
  const [currentPost, setCurrentPost] = useState<PortfolioItem | null>(post);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const API_BASE_URL = "http://localhost:3000/api/profiles";

  const trackView = async (postToTrack: PortfolioItem) => {
    if (!currentPost) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/${currentPost.profileId}/portfolio/${currentPost.id}/view`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.warn("Failed to track view for post:", currentPost.id);
      }

      onLikeSuccess?.();

    } catch (err) {
      console.error("Error tracking view:", err);
    }
  };


  useEffect(() => {
    // We track view only if modal is open, we have a post, and we haven't tracked it yet.
    if (isOpen && currentPost && !hasViewed) {

      trackView(currentPost);

      setHasViewed(true);
    }

    if (!isOpen) {
      setHasViewed(false);
    }

  }, [isOpen, currentPost]);

  // Sync whenever modal opens or post changes
  useEffect(() => {
    if (!post || !isOpen) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/${post.profileId}/portfolio`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch portfolio");

        const portfolio: PortfolioItem[] = await res.json();
        const updatedPost = portfolio.find(p => p.id === post.id) ?? post;

        setCurrentPost(updatedPost);
        setLikesCount(Number(updatedPost.stats?.likes || 0));
        setIsLiked(Number(updatedPost.stats?.likes || 0) > 0);
      } catch (err) {
        console.error(err);
        // fallback to initial post
        setCurrentPost(post);
        setLikesCount(Number(post.stats?.likes || 0));
        setIsLiked(Number(post.stats?.likes || 0) > 0);
      }
    };

    fetchPost();
  }, [post, isOpen]);

  if (!currentPost) return null;

  const handleLike = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/${currentPost.profileId}/portfolio/${currentPost.id}/like`,
        {
          method: isLiked ? "DELETE" : "POST",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to update like");

      const data = await res.json();
      setLikesCount(data.likes);
      setIsLiked(!isLiked);
      onLikeSuccess?.();

    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update like");
    }
  };

  const handleDelete = async () => {
    if (!currentPost) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/${currentPost.profileId}/portfolio/${currentPost.id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to delete post");

      alert("Post deleted successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl w-[95dvw] h-[90dvh] md:min-h-[85dvh] p-8 md:p-5 overflow-hidden flex flex-col gap-0"
        aria-describedby="post-preview-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-border flex-none bg-background">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{currentPost.title}</h2>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 flex-none">
              {currentPost.type}
            </Badge>
          </div>
        </div>

        {/* Media */}
        <div className="relative flex-[3] bg-[#d4d4d4b0] flex items-center justify-center overflow-hidden min-h-0 rounded-[30px]">
          <div className="relative w-full h-full max-w-[450px] mx-auto flex items-center justify-center">
            <div className="relative w-full aspect-[9/16] max-h-full bg-black/5">
              <img
                src={currentPost.image}
                alt={currentPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between gap-4 flex-none">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-5 h-5" />
            <span className="font-semibold text-foreground">{currentPost.stats?.views ?? 0}</span>
            <span className="text-sm">views</span>
          </div>

          <Button variant={isLiked ? "default" : "outline"} onClick={handleLike}>
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Liked" : "Like"} ({likesCount})
          </Button>

          <Button variant="destructive" className="gap-2" onClick={handleDelete}>
            <X className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
