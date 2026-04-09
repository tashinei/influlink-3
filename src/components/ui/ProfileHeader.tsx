import {
  MapPin,
  LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  CheckCircle2,
  MoreHorizontal,
  Camera,
  UserCog,
  LogOut,
  Trash2,
  Facebook,
  Linkedin,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileData } from "@/types/profile";
import { useState } from "react";
import { Info } from "lucide-react";

// --- NEW IMPORTS for Dropdown Menu ---
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./dialog";
import { } from "./dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { BsFacebook, BsInstagram, BsLinkedin, BsYoutube } from "react-icons/bs";
import { useUserStore } from "@/store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@/hooks/use-media.query";

interface ProfileHeaderProps {
  profile: ProfileData;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onChangeProfilePic?: (file: File) => void;
  onEditProfile?: () => void;
  // --- NEW PROP ADDED ---
  isInstagramLinked: boolean;
  onConnectInstagram: () => void;
}

export const ProfileHeader = ({
  profile,
  isFollowing,
  onToggleFollow,
  onChangeProfilePic,
  onEditProfile,
  isInstagramLinked,
}: ProfileHeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const { token } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editNiche, setEditNiche] = useState(profile.niche);
  const [loading, setLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { t } = useTranslation();
  const isOwner = !!onChangeProfilePic;

  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onChangeProfilePic) return;

    // Show preview
    const tempUrl = URL.createObjectURL(file);
    setPreview(tempUrl);

    // Upload file
    await onChangeProfilePic(file);

    // Optional: free memory after upload completes
    URL.revokeObjectURL(tempUrl);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const logout = useUserStore((state) => state.logout);
  const accountType = useUserStore((state) => state.accountType)

  const handleFinalLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${useUserStore.getState().token}`
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout failed", err);
    } finally {
      logout();

      navigate("/");
    }
  };

  const onConnectInstagram = () => {
    const clientID = "1829769444346525";
    const redirectUri = encodeURIComponent(
      "https://mvp.influ-link.com/instagram-callback",
    );
    const scope =
      "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement";

    // Construct the Meta Login URL
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    // Redirect the user
    window.location.href = authUrl;
  };

  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);

  const handleUnlinkClick = () => {
    setIsUnlinkModalOpen(true);
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const response = await fetch(`${API_BASE}/api/instagram/unlink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });

      if (response.ok) {
        // Refresh the page to clear the stats from the UI
        window.location.reload();
      } else {
        const error = await response.json();
        console.error("Unlink failed:", error);
      }
    } catch (err) {
      console.error("Network error during unlink:", err);
    } finally {
      setIsUnlinking(false);
    }
  };

  const navigate = useNavigate();
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  const handleStripeConnect = async () => {
    setIsStripeLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/payouts/setup`, {
        method: "POST",
        credentials: "include", // Essential for HttpOnly cookies
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe's hosted onboarding UI
        window.location.href = data.url;
      } else {
        console.error("Stripe error:", data.error);
      }
    } catch (err) {
      console.error("Failed to initiate Stripe Connect:", err);
    } finally {
      setIsStripeLoading(false);
    }
  };

  const handleClickHowTo = () => {
    navigate("/connect-instagram");
  }

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const API_BASE = "https://api.influ-link.com";
  console.log("Full Profile Data:", profile);
  return (
    <>
      {/* Header Background */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden bg-gradient-to-r from-secondary via-[#90d5f3ff] to-primary">
        <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-primary to-secondary blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-secondary to-primary blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-20 mb-8 flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-44 w-44 md:h-52 md:w-52 rounded-[2rem] p-1.5 bg-background shadow-xl transition-transform group-hover:rotate-3">
              <Avatar className="h-full w-full rounded-[1.7rem]">
                <AvatarImage
                  src={`${API_BASE}${profile.avatar}`}
                  alt={profile.name}
                  style={{ objectFit: "cover" }}
                />
                <AvatarFallback className="rounded-[1.7rem] text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <span
              className="absolute bottom-4 right-2 w-4 h-4 bg-green-500 border-2 border-background rounded-full"
              aria-label="Online"
            />

            {isOwner && (
              <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 p-1 rounded-full cursor-pointer hover:bg-background/90 transition-colors">
                <Camera className="w-5 h-5 text-primary" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <div className="flex-1 pt-2 md:pt-20 space-y-4 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 md:mt-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {profile.name}
                  </h1>
                  {profile.verified && (
                    <CheckCircle2
                      className="w-6 h-6 text-primary fill-[white]"
                      aria-label="Approved"
                    />
                  )}
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-br from-primary to-secondary text-primary-foreground ml-2 py-1 md:py-2"
                  >
                    {profile.type === "creator"
                      ? t("mvpNotifications.creator")
                      : t("mvpNotifications.brand")}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-medium mb-2">
                  {profile.niche}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    {profile.location}
                  </div>
                  <a
                    href={`/${profile.handle.replace("@", "")}`}
                    className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="w-4 h-4" aria-hidden="true" />
                    influ-link.com/{profile.handle.replace("@", "")}
                  </a>
                </div>
              </div>

              {/* Action Buttons Container */}
              <div className="flex flex-col gap-3 w-full self-center md:w-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  {!isOwner ? (
                    <>
                      <Button
                        className={`flex-1 md:flex-none rounded-full px-6 ${isFollowing
                          ? "bg-muted text-foreground"
                          : "bg-gradient-to-br from-secondary to-primary text-white"
                          }`}
                        onClick={onToggleFollow}
                      >
                        {isFollowing
                          ? t("profile.following")
                          : t("profile.follow")}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none rounded-full px-6"
                      >
                        {t("profile.getInTouch")}
                      </Button>
                    </>
                  ) : (
                    <>
                      {isInstagramLinked ? (
                        <Button
                          variant="outline"
                          className="flex-1 md:flex-none rounded-full px-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm h-11"
                          onClick={handleUnlinkClick}
                          disabled={isUnlinking}
                        >
                          {isUnlinking ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            <>
                              <BsInstagram className="w-4 h-4 mr-2" />
                              <span className="truncate">
                                {t("profile.disconnectInstagram")}
                              </span>
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1 md:flex-none rounded-full px-4 border-pink-500 text-pink-600 hover:bg-pink-50 text-sm h-11"
                          onClick={onConnectInstagram}
                        >
                          <BsInstagram className="w-4 h-4 mr-2" />
                          <span className="truncate">
                            {t("profile.connectInstagram")}
                          </span>
                        </Button>
                      )}

                      <Button
                        variant="default"
                        className="flex-1 md:flex-none rounded-full px-4 bg-gradient-to-br from-primary to-secondary text-white text-sm h-11 xs:w-[75%] sm:self-center lg:w-[40%]"
                        onClick={onEditProfile}
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        <span className="truncate">
                          {t("profile.editProfile")}
                        </span>
                      </Button>

                      {/* Desktop Only: Dropdown Menu */}
                      <div className="hidden md:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-11 w-11"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  window.location.href,
                                )
                              }
                            >
                              <LinkIcon className="mr-2 h-4 w-4" />
                              <span>{t("profile.shareProfile")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleClickHowTo}
                              className="bg-gradient-to-tr from-[#FFD600] via-[#FF0069] to-[#7638FA] bg-clip-text text-transparent flex items-center"
                            >
                              <BsInstagram className="mr-2 h-4 w-4 text-[#FF0069]" />
                              <span>{t("profile.howConnectInstagram")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleStripeConnect}
                              disabled={isStripeLoading}
                              className="focus:bg-slate-50 cursor-pointer" // Optional: subtle highlight on hover
                            >
                              <CreditCard className="mr-2 h-4 w-4 text-[#635BFF]" /> {/* Stripe's core Blurple */}

                              <span className={`font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#635BFF] via-[#1ba8c4] to-[#7A73FF] ${isStripeLoading ? 'animate-pulse' : ''}`}>
                                {isStripeLoading ? t("profile.loading") : t("profile.setupPayouts")}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={handleLogoutClick}
                              className="text-red-600"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>{t("profile.logout")}</span>
                            </DropdownMenuItem>

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Only: Secondary Action Row */}
                {isOwner && (
                  <div className="flex md:hidden flex-col gap-2 w-full">
                    {/* Row 1: Share & Logout */}
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-10 text-[10px] xs:text-xs font-semibold border-slate-200"
                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                      >
                        <LinkIcon className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        {t("profile.shareProfile")}
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-10 text-[10px] xs:text-xs font-semibold border-red-100 text-red-600 bg-red-50/30"
                        onClick={handleLogoutClick}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1.5" />
                        {t("profile.logOut")}
                      </Button>
                    </div>

                    {!isInstagramLinked && (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-10 text-xs font-semibold border-slate-200 bg-white/50"
                        onClick={handleClickHowTo}
                      >
                        <BsInstagram className="w-3.5 h-3.5 mr-2 text-[#FF0069]" />
                        <span className="bg-gradient-to-tr from-[#FFD600] via-[#FF0069] to-[#7638FA] bg-clip-text text-transparent">
                          {t("profile.howConnectInstagram")}
                        </span>
                      </Button>
                    )}

                    {/* Row 2: Stripe Payouts (Full Width) */}
                    {profile.stripeOnboardingComplete ? (
                      <Button
                        variant="outline"
                        className="flex-[1.5] rounded-xl h-10 px-1 text-[10px] font-black border-slate-200"
                        onClick={handleViewDashboard}
                        disabled={isStripeLoading}
                      >
                        <CreditCard className="w-3 h-3 mr-1 text-[#635BFF]" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#635BFF] to-[#00D4FF] truncate">
                          Payouts
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStripeConnect}
                        className="bg-gradient-to-r from-[#635BFF] to-[#00D4FF] text-white"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t("profile.setupPayouts")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio & Stats */}
            <div className="flex flex-col md:flex-row gap-8 justify-between border-t border-border pt-6 items-center lg:items-start">
              <div className="max-w-xl">
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
                <div
                  className={`flex gap-4 mt-4 ${isDesktop ? "justify-start" : "justify-center"}`}
                  role="list"
                  aria-label="Social media links"
                >
                  {profile.socialLinks &&
                    Object.entries(profile.socialLinks).map(
                      ([platform, url]) => {
                        // Only render if url exists and is not an empty string
                        if (
                          !url ||
                          typeof url !== "string" ||
                          url.trim() === ""
                        )
                          return null;

                        const formattedUrl = url.startsWith("http")
                          ? url
                          : `https://${url}`;

                        // Define icon and color mapping
                        const platformConfig: Record<
                          string,
                          { icon: JSX.Element; color: string }
                        > = {
                          instagram: {
                            icon: <BsInstagram className="w-5 h-5" />,
                            color: "text-pink-600",
                          },
                          x: {
                            icon: (
                              <i className="fa-brands fa-x-twitter text-lg"></i>
                            ),
                            color: "text-foreground",
                          },
                          youtube: {
                            icon: <BsYoutube className="w-5 h-5" />,
                            color: "text-red-600",
                          },
                          facebook: {
                            icon: <BsFacebook className="w-5 h-5" />,
                            color: "text-blue-600",
                          },
                          linkedin: {
                            icon: <BsLinkedin className="w-5 h-5" />,
                            color: "text-blue-700",
                          },
                        };

                        const config = platformConfig[platform.toLowerCase()];
                        console.log(
                          "Platform:",
                          platform,
                          "Config found:",
                          !!config,
                        );
                        if (!config) return null;

                        return (
                          <a
                            key={platform}
                            href={formattedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 bg-background rounded-full shadow-sm border hover:scale-110 transition-transform flex items-center justify-center ${config.color}`}
                            aria-label={platform}
                          >
                            {config.icon}
                          </a>
                        );
                      },
                    )}
                </div>
              </div>

              <div className="flex gap-8 md:gap-12">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">
                    {Number(profile.stats.followers).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.followers")}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">
                    {profile.stats.engagementRate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.engRate")}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">
                    {profile.stats.totalReach}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.reach")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-[30vw] lg:max-w-[30vw] 2xl:max-w-[20vw] !h-fit p-6 pl-8 pr-8 rounded-xl shadow-xl overflow-hidden flex flex-col gap-0">
          {/* HEADER */}
          <DialogHeader className="text-left space-y-4 p-0 min-h-0 mt-6">
            <div
              className="flex flex-row gap-8 align-middle justify-start"
              style={{ alignItems: "center" }}
            >
              <DialogTitle className="text-xl font-semibold w-[90%]">
                {t("profile.confirmLogout")}
              </DialogTitle>
            </div>

            <DialogDescription className="text-sm text-muted-foreground max-w-sm">
              {t("profile.sureLogout")}
            </DialogDescription>
            <div className="rounded-md bg-transparent px-2 py-1 text-sm text-[gray] flex items-start justify-start gap-2 pl-0 !mb-[20px]">
              <span>
                <Info></Info>
              </span>
              {t("profile.redirectHome")}
            </div>
          </DialogHeader>

          <DialogFooter
            className="mt-2
            p-0
            flex
            flex-row
            justify-end
            items-center
            gap-2
            min-h-0
            m-0
            pb-4"
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-gradient-to-br from-primary to-secondary text-[white]"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              {t("profile.cancel")}
            </Button>

            <Button
              variant="destructive"
              className="w-full sm:w-auto text-red-500"
              onClick={handleFinalLogout}
            >
              <LogOut className="w-4 h-4 mr-2 text-red-400" />
              {t("profile.logOut")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isUnlinkModalOpen} onOpenChange={setIsUnlinkModalOpen}>
        <DialogContent className="sm:max-w-[30dvw] p-8 pt-10 pb-10 lg:pb-0 lg:pt-16 rounded-xl shadow-xl max-h-[30dvh] gap-0">
          <DialogHeader className="text-left space-y-3">
            <DialogTitle className="text-xl font-semibold">
              {t("profile.disconnectInstagramTitle") || "Disconnect Instagram?"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {t("profile.confirmUnlink") ||
                "Are you sure you want to disconnect your Instagram account? Your synced statistics and engagement data will be removed from your profile."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsUnlinkModalOpen(false)}
              disabled={isUnlinking}
            >
              {t("profile.cancel")}
            </Button>

            <Button
              variant="destructive"
              className="rounded-full bg-red-600 hover:bg-red-700"
              onClick={handleUnlink}
              disabled={isUnlinking}
            >
              {isUnlinking ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1 text-white" />
                  <span className="text-white">{t("profile.disconnect")}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
