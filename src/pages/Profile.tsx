import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Rocket,
  ExternalLink,
  Calendar as CalendarIcon,
  Target as TargetIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileHeader } from "@/components/ui/ProfileHeader";
import { PortfolioCard } from "@/components/ui/PortfolioCard";
import { PostPreviewModal } from "@/components/ui/PostPreviewModal";
import { AddPostDialog } from "@/components/ui/AddPostDialog";
import { AnalyticsTab } from "@/components/ui/AnalyticsTab";
import CreateCampaignModal from "@/components/CampaignModal";

import { useProfile } from "@/hooks/useProfile";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAnalytics } from "@/hooks/useAnalytics";

import { useParams, useMatch, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { EditProfileModal } from "@/components/EditProfileModal";
import { PortfolioItem, ProfileData } from "@/types/profile";
import NavigationDock from "@/components/NavigationDock";
import { useUserStore } from "@/store/useUserStore";
import { CampaignDetailModal } from "@/components/campaigns/CampaignDetailModal";
import { EditCampaignModal } from "@/components/campaigns/EditCampaignModal";
import { useTranslation } from "@/hooks/useTranslation";
import { InstagramInsights } from "@/components/InstagramInsights";
import { useInstagramAnalytics } from "@/hooks/useInstagramAnalytics";
import { InstagramInsightsSkeleton } from "@/components/InstagramInsigthsSkeleton";

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const isMyProfileRoute = useMatch("/profile/me");

  const { identifier } = useParams<{ identifier: string }>();
  const { username } = useParams<{ username: string }>();
  const { token, user } = useUserStore();

  const rawIdentifier = username || identifier;

  useEffect(() => {
    console.log("Profile render");
  }, [])

  // Clean the identifier. 
  // If it's empty, "me", or the literal string "profile" (from the route name), 
  // we force it to the logged-in user's ID.
  const cleanIdentifier = rawIdentifier?.split('?')[0];

  const isFallbackNeeded =
    isMyProfileRoute ||
    !cleanIdentifier ||
    cleanIdentifier === "me" ||
    cleanIdentifier === "profile";

  const identifierToFetch = isFallbackNeeded
    ? user?.id?.toString()
    : cleanIdentifier;

  const [isEditCampaignOpen, setIsEditCampaignOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // 4. Fetch the logged-in user's profile (for ownership checks)
  const { profile: myProfile } = useProfile("me");

  // 5. Fetch the profile for the current page
  const {
    profile,
    isLoading: profileLoading,
    isFollowing,
    toggleFollow,
    refetch,
  } = useProfile(identifierToFetch);

  // 6. Ownership logic
  const isOwner =
    isMyProfileRoute ||
    !cleanIdentifier ||
    (profile && myProfile &&
      (profile.handle === myProfile.handle ||
        profile.id === myProfile.id));

  const location = useLocation();

  useEffect(() => {
    if (location.state?.connected) {
      setShowSuccessModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  // Безопасно извличане на API_BASE_URL
  const getApiBaseUrl = () => {
    try {
      // @ts-ignore
      return (
        (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) ||
        (typeof import.meta !== "undefined" &&
          import.meta.env?.VITE_API_BASE_URL) ||
        "http://localhost:3000"
      );
    } catch (e) {
      return "http://localhost:3000";
    }
  };

  const API_BASE_URL = getApiBaseUrl();

  // Portfolio Hooks
  const ownerActions = usePortfolio(isOwner ? profile?.id : undefined);
  const viewerData = usePortfolio(!isOwner ? profile?.id : undefined);

  const portfolioToDisplay = isOwner
    ? ownerActions.portfolio
    : viewerData.portfolio;
  const portfolioLoading = isOwner
    ? ownerActions.isLoading
    : viewerData.isLoading;
  const addPostHandler = isOwner
    ? ownerActions.addPost
    : () => Promise.resolve(false);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

  // Fetch Campaigns
  const fetchCampaigns = async () => {
    if (!isOwner) return;
    setCampaignsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        headers: {
          "Content-Type": "application/json",
          // АКО ИМА ТОКЕН, ГО ПРАЩАМЕ:
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const { data: igStats, loading: igLoading, refetch: refetchIG } = useInstagramAnalytics(user?.id);

  useEffect(() => {
    if (isOwner) fetchCampaigns();
  }, [isOwner]);

  // Analytics
  const {
    analytics,
    isLoading: analyticsLoading,
    isVIP,
    refetchAnalytics,
  } = useAnalytics();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchAnalytics();
    }, 60_000);
    return () => clearInterval(interval);
  }, [refetchAnalytics]);

  // Modals
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PortfolioItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  console.log("Current Analytics Data:", analytics);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const syncStarted = useRef(false);

  useEffect(() => {
    // 1. Exit immediately if not a success status or already processing
    if (status !== "success" || syncStarted.current || !token) return;

    // 2. Lock it immediately
    syncStarted.current = true;

    // 3. Show the modal
    setShowSuccessModal(true);

    navigate(window.location.pathname, { replace: true, state: {} });

    const triggerSync = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/instagram/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.ok) {
          refetchIG();
          refetchAnalytics();
          refetch();
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    triggerSync();
  }, [status, token, navigate, API_BASE_URL, refetchIG, refetchAnalytics, refetch]);

  useEffect(() => {
    if (showSuccessModal) return;

    if (status === "success") return;

    if (!isMyProfileRoute && profile && myProfile) {
      if (profile.handle === myProfile.handle || profile.id === myProfile.id) {
        navigate("/profile/me", { replace: true });
      }
    }
  }, [profile, myProfile, isMyProfileRoute, navigate, status, showSuccessModal]);

  const profileWithLiveStats: ProfileData = {
    ...profile,
    stats: {
      ...profile?.stats,
      totalReach: analytics?.totalViews
        ? Number(analytics.totalViews).toLocaleString()
        : profile?.stats?.totalReach || "0",

      engagementRate: (() => {
        if (!analytics) return profile?.stats?.engagementRate || "0%";

        const likes = Number(analytics.totalLikes || 0);
        const views = Number(analytics.totalViews || 0);
        const backendEngagement = Number(analytics.avgEngagement || 0);

        if (backendEngagement === 0 && views > 0) {
          return ((likes / views) * 100).toFixed(1) + "%";
        }

        if (backendEngagement > 0 && backendEngagement < 1) {
          return (backendEngagement * 100).toFixed(1) + "%";
        }

        return backendEngagement > 0
          ? backendEngagement.toFixed(1) + "%"
          : (profile?.stats?.engagementRate || "0.0%");
      })(),
    },
  } as ProfileData;

  const handleSaveProfile = async (updated: Partial<ProfileData>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profiles/me/update`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }
      await refetch();
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile: " + (error as Error).message);
    }
  };

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
      const dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.value = window.location.href;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      alert("Link copied to clipboard!");
    }
  };

  const handleConnectInstagram = () => {
    // Replace with your actual backend auth URL
    const authUrl = `${API_BASE_URL}/auth/instagram`;
    window.location.href = authUrl;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }) // Добави това
        },
        credentials: "include",
      });
      if (response.ok) {
        useUserStore.getState().logout();
        localStorage.removeItem("user-storage");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshSelectedCampaign = async (campaignId: string | number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setCampaigns(data);

      const updated = data.find((c: any) => c.id === campaignId);
      if (updated) {
        setSelectedCampaign(updated);
      }
    } catch (err) {
      console.error("Failed to refresh campaign:", err);
    }
  };

  const { t } = useTranslation();

  const handleProfilePicChange = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`${API_BASE_URL}/profiles/me/avatar`, {
        method: "POST",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        },
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

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Instagram Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#833ab4] via-[#fd1d1d] to-[#fcb045] opacity-95 animate-in fade-in duration-500" />

        <Card className="relative w-full max-w-sm border-none shadow-2xl bg-gradient-to-br from-secondary via-tertiary to-primary backdrop-blur-md text-white overflow-hidden animate-in zoom-in-95 duration-300">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <div className="bg-white rounded-full p-1">
                <svg className="w-12 h-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Account connected!</CardTitle>
            <CardDescription className="text-white text-base px-2">
              Your Instagram insights are successfully synced. Your profile is now professional and data-driven.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button
              className="w-full bg-white text-secondary hover:bg-white/80 font-bold py-6 rounded-2xl shadow-lg transition-transform active:scale-95"
              onClick={() => {
                setShowSuccessModal(false);
                refetch();
                refetchIG(); 
                navigate("/profile/me", { replace: true })
              }}
            >
              Got it
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
          {status === "success" && <p className="text-sm animate-pulse">Finalizing sync...</p>}
        </div>
      </div>
    );
  }

  if (!profile && !profileLoading && status !== "success") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => navigate("/profile/me")}>Go to my profile</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p>Profile not found.</p>
        <Button onClick={() => navigate("/profile/me")}>Go to my profile</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-20">
      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <CreateCampaignModal
        open={isCreateCampaignOpen}
        onOpenChange={setIsCreateCampaignOpen}
        onSuccess={() => {
          fetchCampaigns();
        }}
      />

      <ProfileHeader
        profile={profileWithLiveStats}
        isFollowing={isFollowing}
        onToggleFollow={toggleFollow}
        onChangeProfilePic={isOwner ? handleProfilePicChange : undefined}
        onEditProfile={isOwner ? () => setIsEditProfileOpen(true) : undefined}
        onLogout={handleLogout}
        onConnectInstagram={isOwner ? handleConnectInstagram : undefined}
      />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Tabs
          defaultValue={profile.type === "creator" ? "portfolio" : "campaigns"}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-6 gap-3">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b border-border flex-1 justify-start rounded-none overflow-x-auto">
              {profile.type === "creator" && (
                <TabsTrigger
                  value="portfolio"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
                >
                  {t("mvpProfileTabs.portfolio")}
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-muted text-muted-foreground text-xs"
                  >
                    {portfolioToDisplay.length}
                  </Badge>
                </TabsTrigger>
              )}
              {isOwner && profile.type === "brand" && (
                <>
                  <TabsTrigger
                    value="campaigns"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
                  >
                    {t("mvpProfileTabs.campaigns")}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-muted text-muted-foreground text-xs"
                    >
                      {campaigns.length}
                    </Badge>
                  </TabsTrigger>

                </>
              )}
              <TabsTrigger
                value="analytics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
              >
                {t("mvpAnalytics.title")}
              </TabsTrigger>
            </TabsList>

            {isOwner && (
              <Button
                size="sm"
                onClick={() => setIsAddPostOpen(true)}
                className="gap-2 rounded-full bg-gradient-to-br from-primary to-secondary hover:scale-105 transition"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">{t("mvpProfileTabs.addWork")}</span>
              </Button>
            )}
          </div>

          {profile.type === "creator" && (
            <TabsContent value="portfolio">
              {portfolioLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
                </div>
              ) : portfolioToDisplay.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground mb-4">
                    {t("mvpProfileTabs.noPortfolioItems")}
                  </p>
                  {isOwner && (
                    <Button onClick={() => setIsAddPostOpen(true)}>
                      {t("mvpProfileTabs.addFirstWork")}
                    </Button>
                  )}
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
          )}

          {isOwner && (
            <>
              <TabsContent value="campaigns">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{t("mvpProfileTabs.yourCampaigns")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("mvpProfileTabs.manageCampaigns")}
                      </p>
                    </div>
                  </div>

                  {campaignsLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-16 bg-muted/10 rounded-2xl border border-dashed flex flex-col items-center">
                      <div className="p-4 bg-primary/5 rounded-full mb-4">
                        <Rocket className="w-10 h-10 text-primary/40" />
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {t("mvpProfileTabs.noCampaignsYet")}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateCampaignOpen(true)}
                      >
                        {t("mvpProfileTabs.startNow")}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaigns.map((camp) => (
                        <Card
                          key={camp.id}
                          onClick={() => {
                            setSelectedCampaign(camp);
                            setIsCampaignModalOpen(true);
                          }}
                          className="hover:shadow-md transition-shadow group"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <Badge
                                variant="outline"
                                className="mb-2 bg-primary/5 text-primary border-primary/20 capitalize"
                              >
                                {camp.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardTitle className="text-lg">
                              {camp.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {camp.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {camp.startDate
                                  ? new Date(camp.startDate).toDateString()
                                  : null}
                              </div>
                              <div className="flex items-center gap-1 font-medium text-foreground">
                                <TargetIcon className="h-3 w-3 text-primary" />$
                                {Number(camp.budget).toLocaleString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="flex gap-[60px] flex-col">
                {igLoading ? (
                  <InstagramInsightsSkeleton />
                ) : (
                  <InstagramInsights data={igStats} />
                )}

                <AnalyticsTab
                  analytics={analytics}
                  isVIP={isVIP}
                  isLoading={analyticsLoading}
                />
              </TabsContent>
            </>
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

      {selectedCampaign && (
        <CampaignDetailModal
          open={isCampaignModalOpen}
          onOpenChange={setIsCampaignModalOpen}
          campaign={selectedCampaign}
          onEdit={() => {
            setIsEditCampaignOpen(true);
          }}
          onPauseResume={() => console.log("Pause/Resume", selectedCampaign.id)}
          onDelete={() => {
            fetchCampaigns();
            setIsCampaignModalOpen(false);
          }}
        />
      )}

      {selectedCampaign && (
        <EditCampaignModal
          open={isEditCampaignOpen}
          onOpenChange={setIsEditCampaignOpen}
          campaign={selectedCampaign}
          onSuccess={() => {
            fetchCampaigns();
            refreshSelectedCampaign(selectedCampaign.id);
          }}
        />
      )}

      <AddPostDialog
        isOpen={isAddPostOpen}
        onClose={() => setIsAddPostOpen(false)}
        onSubmit={addPostHandler}
      />
      <NavigationDock onCampaignCreated={fetchCampaigns} />
    </div>
  );
};

export default Profile;
