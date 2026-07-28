import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Rocket,
  ExternalLink,
  Calendar as CalendarIcon,
  Target as TargetIcon,
  CreditCard,
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
import { CreatorOnboardingDialog } from "@/components/onboarding/CreatorOnboardingDialog";
import { ProfileTour, buildProfileTourSteps } from "@/components/onboarding/ProfileTour";
import { PlansSection } from "@/components/plans/PlansSection";
import { EditPlansDialog } from "@/components/plans/EditPlansDialog";
import { useCreatorPlans } from "@/hooks/useCreatorPlans";
import { useUserStore } from "@/store/useUserStore";
import { CampaignDetailModal } from "@/components/campaigns/CampaignDetailModal";
import { EditCampaignModal } from "@/components/campaigns/EditCampaignModal";
import { useTranslation } from "@/hooks/useTranslation";
import { InstagramInsights } from "@/components/InstagramInsights";
import { useInstagramAnalytics } from "@/hooks/useInstagramAnalytics";
import { InstagramInsightsSkeleton } from "@/components/InstagramInsigthsSkeleton";
import { Helmet } from "react-helmet-async";

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const isMyProfileRoute = useMatch("/profile/me");
  const stripeStatus = searchParams.get("stripe");

  const { identifier, username } = useParams<{ identifier?: string; username?: string }>();
  const rawIdentifier = username || identifier;
  const { user } = useUserStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  const handleStripeAction = async () => {
    setIsStripeLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payouts/stripe-action`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Stripe action failed:", err);
    } finally {
      setIsStripeLoading(false);
    }
  };

  // 5. Fetch the profile for the current page
  const {
    profile,
    isLoading: profileLoading,
    isFollowing,
    toggleFollow,
    refetch,
  } = useProfile(identifierToFetch);

  // 6. Ownership logic
  const isOwner = Boolean(
    isMyProfileRoute ||
    (cleanIdentifier && profile && myProfile &&
      (profile.handle === myProfile.handle ||
        profile.id === myProfile.id))
  );

  const location = useLocation();

  useEffect(() => {
    if (location.state?.connected) {
      setShowSuccessModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  // First-run onboarding: show once for a creator viewing their own profile
  // (e.g. right after registration). `location.state.onboarding` force-opens it;
  // otherwise it opens the first time and is remembered in localStorage.
  const ONBOARDING_KEY = "influlink_creator_onboarding_v1";
  useEffect(() => {
    if (!isOwner || profile?.type !== "creator") return;
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (location.state?.onboarding || !seen) {
      setShowOnboarding(true);
    }
  }, [isOwner, profile?.type, location.state]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, "1");
    if (location.state?.onboarding) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  };

  // Coach-mark tour: fired by "Get started" at the end of the onboarding
  // dialog. Skipping the dialog skips the tour too. The short delay lets the
  // dialog animate out first, so the tour measures a settled layout.
  const [pendingTour, setPendingTour] = useState(false);
  useEffect(() => {
    if (!pendingTour) return;
    const id = window.setTimeout(() => {
      setPendingTour(false);
      setShowTour(true);
    }, 350);
    return () => window.clearTimeout(id);
  }, [pendingTour]);

  useEffect(() => {
    if (!stripeStatus) return;

    if (stripeStatus === "success") {
      fetch(`${API_BASE_URL}/payouts/status`, {
        method: "POST",
        credentials: "include",
      })
        .then(r => r.json())
        .then(async data => {
          if (data.complete) {
            toast(
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#635BFF] shrink-0" />
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#635BFF] via-[#1ba8c4] to-[#7A73FF]">
                  Payouts enabled!
                </span>
              </div>,
              {
                style: {
                  background: "white",
                  border: "none",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                },
                duration: 2500,
              }
            )
          }
          await refetch(); // ← await before navigate
          navigate("/profile/me", { replace: true });
        })
        .catch(err => console.error("Status check failed:", err));
    }

    if (stripeStatus === "refresh") {
      handleStripeAction();
    }
  }, [stripeStatus]);

  useEffect(() => {
    if (location.state?.openChat && location.state?.partner) {
      setSelectedPartner(location.state.partner);
      setIsChatOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

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

  // Creator rate card. Fetched for the profile being viewed, not the viewer.
  const {
    plans,
    isLoading: plansLoading,
    savePlans,
  } = useCreatorPlans(profile?.id);
  const [isEditPlansOpen, setIsEditPlansOpen] = useState(false);

  // Modals
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const selectedPost = portfolioToDisplay.find(
    p => p.id === selectedPostId
  ) || null;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  console.log("Current Analytics Data:", analytics);

  const [isIGLinked, setIsIGLinked] = useState(profile?.stats?.instagramLinked || false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const syncStarted = useRef(false);

  useEffect(() => {
    if (status !== "success" || syncStarted.current || !user) return;

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
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.ok) {
          refetchIG();
          setIsIGLinked(true);
          refetchAnalytics();
          refetch();
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    triggerSync();
  }, [status, user, navigate, API_BASE_URL, refetchIG, refetchAnalytics, refetch]);

  useEffect(() => {
    if (profile?.stats?.instagramLinked !== undefined) {
      setIsIGLinked(profile.stats.instagramLinked);
    }
  }, [profile]);

  useEffect(() => {
    console.log("Redirect check:", {
      isMyProfileRoute,
      cleanIdentifier,
      profileHandle: profile?.handle,
      myProfileHandle: myProfile?.handle,
      profileId: profile?.id,
      myProfileId: myProfile?.id,
      showSuccessModal,
      status
    });

    if (!isMyProfileRoute && cleanIdentifier && profile && myProfile && !showSuccessModal && status !== "success") {
      if (profile.handle === myProfile.handle || profile.id === myProfile.id) {
        console.log("REDIRECTING - profiles match");
        navigate("/profile/me", { replace: true });
      }
    }
  }, [profile, myProfile, isMyProfileRoute, cleanIdentifier, navigate, status, showSuccessModal]);

  console.log("identifierToFetch:", identifierToFetch, "rawIdentifier:", rawIdentifier);

  const profileWithLiveStats: ProfileData = {
    ...profile,
    stripeOnboardingComplete: profile?.stripeOnboardingComplete ?? false,
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
      instagramLinked: profile?.stats?.instagramLinked
    },
  } as ProfileData;

  useEffect(() => {
    const fromGoogle = searchParams.get("fromGoogle");

    if (fromGoogle) {
      const exchange = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/exchange-google-token`, {
            credentials: 'include'
          });

          if (res.ok) {
            const data = await res.json();

            const store = useUserStore.getState();
            store.setToken(data.token);
            store.setUser(data.user);

            store.setRegistered(true);

            if (data.user.account_type) {
              store.setAccountType(data.user.account_type);
            }

            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error("Token exchange failed:", err);
        }
      };
      exchange();
    }
  }, [searchParams]);

  const handleSaveProfile = async (updated: Partial<ProfileData>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profiles/me/update`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
    setSelectedPostId(post.id);
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

  // Rate cards are display-only, so the CTA on a plan opens a conversation
  // with the creator rather than any kind of checkout.
  const handleContactCreator = () => {
    if (!profile) return;
    setSelectedPartner({
      id: profile.id,
      handle: profile.handle,
      name: profile.name,
      avatar: profile.avatar,
    });
    setIsChatOpen(true);
  };

  const handleConnectInstagram = () => {
    // Replace with your actual backend auth URL
    const authUrl = `${API_BASE_URL}/auth/instagram`;
    window.location.href = authUrl;
  };

  const refreshSelectedCampaign = async (campaignId: string | number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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

  const tourSteps = useMemo(() => buildProfileTourSteps(t), [t]);

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

  const seoTitle = useMemo(() => {
    const name = profile?.name || profile?.handle || "Profile";
    const type = profile?.type === "creator" ? t("profile.creator") : t("profile.brand");
    return `${name} | ${type} on InfluLink`;
  }, [profile, t]);

  const seoDescription = useMemo(() => {
    const name = profile?.name || profile?.handle || "This user";
    const niche = profile?.niche || "";
    const bio = profile?.bio ? profile.bio.substring(0, 100) + "..." : "";

    const defaultDesc = t("profile.defaultMetaDescription")
      .replace("{{name}}", name);

    if (niche) {
      return t("profile.nicheMetaDescription")
        .replace("{{name}}", name)
        .replace("{{niche}}", niche)
        .replace("{{bio}}", bio);
    }

    return defaultDesc;
  }, [profile, t]);

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
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />

        {/* Open Graph / Social Media */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={profile?.avatar || "/og-default.png"} />
        <meta property="og:type" content="profile" />
        <meta property="profile:username" content={profile?.handle} />

        {/* Canonical URL to prevent duplicate content issues with /profile/me vs /profile/username */}
        <link rel="canonical" href={`${window.location.origin}/profile/${profile?.handle}`} />
      </Helmet>

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
        onConnectInstagram={isOwner ? handleConnectInstagram : undefined}
        isInstagramLinked={isIGLinked}
        onStripeAction={isOwner ? handleStripeAction : undefined}
        isStripeLoading={isStripeLoading}
      />

      {/* Rate card sits on the profile itself rather than behind a tab — for a
          visiting brand it's the point of the page. Hidden only when a visitor
          would see nothing. */}
      {profile.type === "creator" && (isOwner || plans.length > 0) && (
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <PlansSection
            plans={plans}
            isLoading={plansLoading}
            isOwner={isOwner}
            onEdit={() => setIsEditPlansOpen(true)}
            onContact={handleContactCreator}
          />
        </div>
      )}

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
                data-tour="analytics-tab"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
              >
                {t("mvpAnalytics.title")}
              </TabsTrigger>
            </TabsList>

            {isOwner && (
              <Button
                size="sm"
                data-tour="add-work"
                onClick={() => { profile.type == "creator" ? setIsAddPostOpen(true) : setIsCreateCampaignOpen(true) }}
                className="gap-2 rounded-full bg-gradient-to-br from-primary to-secondary hover:scale-105 transition"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">{profile.type == "creator" ? t("mvpProfileTabs.addWork") : t("mvpProfileTabs.newCampaign")}</span>
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
          setTimeout(() => setSelectedPostId(null), 200);
        }}
        onLikeSuccess={() => {
          if (isOwner) {
            ownerActions.refetch();
          } else {
            viewerData.refetch();
          }
          refetchAnalytics();
        }}
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

      {isOwner && (
        <EditPlansDialog
          open={isEditPlansOpen}
          onOpenChange={setIsEditPlansOpen}
          plans={plans}
          onSave={savePlans}
        />
      )}
      <NavigationDock
        onCampaignCreated={fetchCampaigns}
        initialChatOpen={isChatOpen}
        initialChatPartner={selectedPartner}
        onChatStateChange={(open) => setIsChatOpen(open)} />

      <CreatorOnboardingDialog
        open={showOnboarding}
        onOpenChange={(open) => (open ? setShowOnboarding(true) : dismissOnboarding())}
        onFinish={() => setPendingTour(true)}
      />

      <ProfileTour open={showTour} steps={tourSteps} onClose={() => setShowTour(false)} />
    </div>
  );
};

export default Profile;
