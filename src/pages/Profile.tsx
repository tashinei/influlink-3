import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/ui/ProfileHeader";
import { PortfolioCard } from "@/components/ui/PortfolioCard";
import { PostPreviewModal } from "@/components/ui/PostPreviewModal";
import { AddPostDialog } from "@/components/ui/AddPostDialog";
import { useProfile } from "@/hooks/useProfile";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioItem } from "@/types/profile";
import { AnalyticsTab } from "@/components/ui/AnalyticsTab";
import { useAnalytics } from "@/hooks/useAnalytics";

import { useParams, useMatch, useNavigate } from 'react-router-dom';


const Profile = () => {
  const navigate = useNavigate();
  const isMyProfileRoute = useMatch("/profile/me");
  const { identifier } = useParams<{ identifier: string }>();
  const identifierToFetch = isMyProfileRoute ? undefined : identifier;
  const { profile: myProfile } = useProfile(undefined);

  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PortfolioItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Kept, though unused

  const { analytics, isLoading: analyticsLoading, isVIP, refetchAnalytics } = useAnalytics();

  const { profile, isLoading: profileLoading, isFollowing, toggleFollow, refetch } = useProfile(identifierToFetch);
  const targetProfileId = profile?.id;

  const isOwner = isMyProfileRoute ||
    (profile && myProfile &&
      (profile.handle === myProfile.handle || profile.id === myProfile.id));

  useEffect(() => {
    if (!isMyProfileRoute && profile && myProfile) {
      if (profile.handle === myProfile.handle || profile.id === myProfile.id) {
        navigate("/profile/me", { replace: true });
      }
    }
  }, [profile, myProfile, isMyProfileRoute, navigate]);

  const ownerActions = usePortfolio(isOwner ? targetProfileId : undefined);

  const viewerData = usePortfolio(!isOwner ? targetProfileId : undefined);

  const portfolioToDisplay = isOwner ? ownerActions.portfolio : viewerData.portfolio;
  const portfolioLoading = isOwner ? ownerActions.isLoading : viewerData.isLoading;

  const addPostHandler = isOwner ? ownerActions.addPost : () => Promise.resolve(false);

  const handlePostClick = (post: PortfolioItem) => {
    setSelectedPost(post);
    setIsPreviewOpen(true);
  };

  const handleSharePost = async (post?: PortfolioItem) => {
    const postToShare = post || selectedPost;
    if (!postToShare) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: postToShare.title,
          text: postToShare.description,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleProfilePicChange = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("http://localhost:3000/api/profiles/me/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update profile picture");

      await refetch();

    } catch (err) {
      console.error(err);
      alert("Failed to update profile picture.");
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile && identifierToFetch) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }


  return (
    <div className="min-h-dvh bg-background pb-20">
      <ProfileHeader
        profile={profile}
        isFollowing={isFollowing}
        onToggleFollow={toggleFollow}
        onChangeProfilePic={isOwner ? handleProfilePicChange : undefined}
      />
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Tabs defaultValue="portfolio" className="w-full">
          <div className="flex items-center justify-between mb-6 gap-3">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b border-border flex-1 justify-start rounded-none overflow-x-auto">
              <TabsTrigger
                value="portfolio"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3 text-base text-muted-foreground px-0 whitespace-nowrap"
              >
                Portfolio <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground text-xs">{portfolioToDisplay.length}</Badge>
              </TabsTrigger>

              {isOwner && (
                <TabsTrigger
                  value="analytics"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3 text-base text-muted-foreground px-0 whitespace-nowrap"
                >
                  Analytics
                </TabsTrigger>
              )}
            </TabsList>
            {isOwner && (
              <Button
                size="sm"
                onClick={() => setIsAddPostOpen(true)}
                className="gap-2 rounded-full flex-shrink-0 bg-gradient-to-br from-primary to-secondary"
              >
                <Plus className="w-8 h-8" />
                <span className="hidden md:inline">Add Work</span>
              </Button>
            )}
          </div>

          <TabsContent value="portfolio" className="mt-0">
            {portfolioLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : portfolioToDisplay.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground mb-4">No portfolio items yet</p>
                {isOwner && <Button onClick={() => setIsAddPostOpen(true)}>Add Your First Work</Button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioToDisplay.map(item => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    onClick={() => handlePostClick(item)}
                    onShare={() => handleSharePost(item)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 🎯 Analytics TabContent only renders if isOwner is true */}
          {isOwner && (
            <TabsContent value="analytics">
              <AnalyticsTab
                analytics={analytics}
                isVIP={isVIP}
                isLoading={analyticsLoading}
              />
            </TabsContent>
          )}

        </Tabs>
      </div>

      <PostPreviewModal
        post={selectedPost}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setTimeout(() => setSelectedPost(null), 200);
        }}
        onLikeSuccess={refetchAnalytics}
      />

      <AddPostDialog
        isOpen={isAddPostOpen}
        onClose={() => setIsAddPostOpen(false)}
        onSubmit={addPostHandler}
      />
    </div>
  );
};

export default Profile;