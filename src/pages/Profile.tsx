import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/ui/ProfileHeader";
import { PortfolioCard } from "@/components/ui/PortfolioCard";
import { PostPreviewModal } from "@/components/ui/PostPreviewModal";
import { AddPostDialog } from "@/components/ui/AddPostDialog";
import { AnalyticsTab } from "@/components/ui/AnalyticsTab";

import { useProfile } from "@/hooks/useProfile";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAnalytics } from "@/hooks/useAnalytics";

import { useParams, useMatch, useNavigate } from "react-router-dom";
import { EditProfileModal } from "@/components/EditProfileModal";
import { PortfolioItem, ProfileData } from "@/types/profile";
import NavigationDock from "@/components/NavigationDock";

const Profile = () => {
  const navigate = useNavigate();
  const isMyProfileRoute = useMatch("/profile/me");
  const { identifier } = useParams<{ identifier: string }>();

  const identifierToFetch = isMyProfileRoute ? undefined : identifier;
  const { profile: myProfile } = useProfile(undefined);

  const { profile, isLoading: profileLoading, isFollowing, toggleFollow, refetch } =
    useProfile(identifierToFetch);

  const isOwner =
    isMyProfileRoute ||
    (profile && myProfile && (profile.handle === myProfile.handle || profile.id === myProfile.id));

  useEffect(() => {
    if (!isMyProfileRoute && profile && myProfile) {
      if (profile.handle === myProfile.handle || profile.id === myProfile.id) {
        navigate("/profile/me", { replace: true });
      }
    }
  }, [profile, myProfile, isMyProfileRoute, navigate]);

  // Portfolio Hooks
  const ownerActions = usePortfolio(isOwner ? profile?.id : undefined);
  const viewerData = usePortfolio(!isOwner ? profile?.id : undefined);

  const portfolioToDisplay = isOwner ? ownerActions.portfolio : viewerData.portfolio;
  const portfolioLoading = isOwner ? ownerActions.isLoading : viewerData.isLoading;
  const addPostHandler = isOwner ? ownerActions.addPost : () => Promise.resolve(false);


  // Analytics
  const { analytics, isLoading: analyticsLoading, isVIP, refetchAnalytics } = useAnalytics();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchAnalytics();
    }, 60_000); // match backend batch interval
    return () => clearInterval(interval);
  }, [refetchAnalytics]);

  // Modals
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PortfolioItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // EDIT PROFILE MODAL
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const profileWithLiveStats: ProfileData = {
    ...profile,
    stats: {
      ...profile?.stats,
      totalReach: analytics ? analytics?.totalViews.toString() : profile?.stats.totalReach,
      engagementRate: analytics?.avgEngagement
        ? (analytics?.avgEngagement * 100).toFixed(1) + "%"
        : profile?.stats.engagementRate
    },
  };

  const handleSaveProfile = async (updated: Partial<ProfileData>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profiles/me/update`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }

      await refetch(); // reload profile data
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile: " + (error as Error).message);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


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
          url: window.location.href,
        });
      } catch { }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };


  const handleProfilePicChange = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_BASE_URL}/profiles/me/avatar`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update avatar");

      await refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile picture.");
    }
  };


  // LOADING STATES
  if (profileLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }


  // ---------------- RENDER ----------------
  return (
    <div className="min-h-dvh bg-background pb-20">
      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* PROFILE HEADER */}
      <ProfileHeader
        profile={profileWithLiveStats}
        isFollowing={isFollowing}
        onToggleFollow={toggleFollow}
        onChangeProfilePic={isOwner ? handleProfilePicChange : undefined}
        onEditProfile={isOwner ? () => setIsEditProfileOpen(true) : undefined}
      />

      {/* TABS */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Tabs defaultValue="portfolio" className="w-full">
          <div className="flex items-center justify-between mb-6 gap-3">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b border-border flex-1 justify-start rounded-none overflow-x-auto">
              <TabsTrigger
                value="portfolio"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
              >
                Portfolio
                <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground text-xs">
                  {portfolioToDisplay.length}
                </Badge>
              </TabsTrigger>

              {isOwner && (
                <TabsTrigger
                  value="analytics"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
                >
                  Analytics
                </TabsTrigger>
              )}
            </TabsList>

            {isOwner && (
              <Button
                size="sm"
                onClick={() => setIsAddPostOpen(true)}
                className="gap-2 rounded-full bg-gradient-to-br from-primary to-secondary hover:scale-105 transition"
              >
                <Plus className="w-8 h-8" />
                <span className="hidden md:inline">Add Work</span>
              </Button>
            )}
          </div>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            {portfolioLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
              </div>
            ) : portfolioToDisplay.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No portfolio items yet</p>
                {isOwner && <Button onClick={() => setIsAddPostOpen(true)}>Add Your First Work</Button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioToDisplay.map((item) => (
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

          {/* Analytics Tab */}
          {isOwner && (
            <TabsContent value="analytics">
              <AnalyticsTab analytics={analytics} isVIP={isVIP} isLoading={analyticsLoading} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* MODALS */}
      <PostPreviewModal
        post={selectedPost}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setTimeout(() => setSelectedPost(null), 200);
        }}
        onLikeSuccess={refetchAnalytics}
      />

      <AddPostDialog isOpen={isAddPostOpen} onClose={() => setIsAddPostOpen(false)} onSubmit={addPostHandler} />

      <NavigationDock></NavigationDock>
    </div>
  );
};

export default Profile;
