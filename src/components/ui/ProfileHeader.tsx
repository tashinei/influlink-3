import { MapPin, LinkIcon, Instagram, Twitter, Youtube, CheckCircle2, MoreHorizontal, Camera, UserCog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileData } from "@/types/profile";
import { useState } from "react";
import { Info } from "lucide-react";

// --- NEW IMPORTS for Dropdown Menu ---
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "./dialog";
import { } from "./dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { BsInstagram } from "react-icons/bs";

interface ProfileHeaderProps {
  profile: ProfileData;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onChangeProfilePic?: (file: File) => void;
  onEditProfile?: () => void;
  // --- NEW PROP ADDED ---
  isInstagramLinked?: boolean;
  onConnectInstagram: () => void;
  onLogout: () => void;
}

export const ProfileHeader = ({ profile, isFollowing, onToggleFollow, onChangeProfilePic, onEditProfile, onLogout }: ProfileHeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

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

  const onConnectInstagram = () => {
    const clientID = "1829769444346525";
    const redirectUri = encodeURIComponent("https://anitra-nonenigmatic-areally.ngrok-free.dev/instagram-callback");
    const scope = "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement";

    // Construct the Meta Login URL
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    // Redirect the user
    window.location.href = authUrl;
  };

  const API_BASE = "https://api.influ-link.com";
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
                <AvatarImage src={`${API_BASE}${profile.avatar}`} alt={profile.name} style={{ objectFit: "cover" }} />
                <AvatarFallback className="rounded-[1.7rem] text-2xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>
            <span className="absolute bottom-4 right-2 w-4 h-4 bg-green-500 border-2 border-background rounded-full" aria-label="Online" />

            {isOwner && (
              <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 p-1 rounded-full cursor-pointer hover:bg-background/90 transition-colors">
                <Camera className="w-5 h-5 text-primary" />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <div className="flex-1 pt-2 md:pt-20 space-y-4 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 md:mt-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
                  {profile.verified && (
                    <CheckCircle2 className="w-6 h-6 text-primary fill-[white]" aria-label="Approved" />
                  )}
                  <Badge variant="secondary" className="bg-gradient-to-br from-primary to-secondary text-primary-foreground ml-2 py-1 md:py-2">
                    {profile.type === "creator" ? t("mvpNotifications.creator") : t("mvpNotifications.brand")}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-medium mb-2">{profile.niche}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    {profile.location}
                  </div>
                  <a
                    href={`/${profile.handle.replace('@', '')}`}
                    className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="w-4 h-4" aria-hidden="true" />
                    influ-link.com/{profile.handle.replace('@', '')}
                  </a>
                </div>
              </div>

              {/* Action Buttons Container */}
              <div className="flex flex-col gap-3 w-full self-center md:w-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  {!isOwner ? (
                    <>
                      <Button
                        className={`flex-1 md:flex-none rounded-full px-6 ${isFollowing ? "bg-muted text-foreground" : "bg-gradient-to-br from-secondary to-primary text-white"
                          }`}
                        onClick={onToggleFollow}
                      >
                        {isFollowing ? t("profile.following") : t("profile.follow")}
                      </Button>
                      <Button variant="outline" className="flex-1 md:flex-none rounded-full px-6">
                        {t("profile.getInTouch")}
                      </Button>
                    </>
                  ) : (
                    <>
                      {!profile.stats.instagramLinked && (
                        <Button
                          variant="outline"
                          className="flex-1 md:flex-none rounded-full px-4 border-pink-500 text-pink-600 hover:bg-pink-50 text-sm h-11 sm:w-[75%] sm:self-center lg:w-[50%]"
                          onClick={onConnectInstagram}
                        >
                          <BsInstagram className="w-4 h-4 mr-2" />
                          <span className="truncate">{t("profile.connectInstagram")}</span>
                        </Button>
                      )}

                      <Button
                        variant="default"
                        className="flex-1 md:flex-none rounded-full px-4 bg-gradient-to-br from-primary to-secondary text-white text-sm h-11 xs:w-[75%] sm:self-center lg:w-[40%]"
                        onClick={onEditProfile}
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        <span className="truncate">{t("profile.editProfile")}</span>
                      </Button>

                      {/* Desktop Only: Dropdown Menu */}
                      <div className="hidden md:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                              <LinkIcon className="mr-2 h-4 w-4" />
                              <span>{t("profile.shareProfile")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600">
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>{t("profile.logout")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Only: Secondary Action Row (Share & Logout) */}
                {isOwner && (
                  <div className="flex md:hidden items-center gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-10 text-xs font-semibold border-slate-200"
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                    >
                      <LinkIcon className="w-3.5 h-3.5 mr-2 text-slate-500" />
                      {t("profile.shareProfile")}
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-10 text-xs font-semibold border-red-100 text-red-600 bg-red-50/30"
                      onClick={handleLogoutClick}
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      {t("profile.logOut")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio & Stats */}
            <div className="flex flex-col md:flex-row gap-8 justify-between border-t border-border pt-6 items-center lg:items-start">
              <div className="max-w-xl">
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                <div className="flex gap-4 mt-4" role="list" aria-label="Social media links">
                  {profile.socialLinks.instagram && (
                    <a
                      href={profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-background rounded-full shadow-sm border hover:scale-110 transition-transform"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </a>
                  )}
                  {profile.socialLinks.x && (
                    <a
                      href={profile.socialLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-background rounded-full shadow-sm border hover:scale-110 transition-transform"
                      aria-label="X"
                    >
                      <i className="fa-brands fa-x-twitter absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a
                      href={profile.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-background rounded-full shadow-sm border hover:scale-110 transition-transform"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-5 h-5 text-red-600" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-8 md:gap-12">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">
                    {Number(profile.stats.followers).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("profile.followers")}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">{profile.stats.engagementRate}</p>
                  <p className="text-sm text-muted-foreground">{t("profile.engRate")}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">{profile.stats.totalReach}</p>
                  <p className="text-sm text-muted-foreground">{t("profile.reach")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-[30dvw] p-8 pt-6 rounded-xl shadow-xl max-h-[30dvh] pb-0 gap-0">

          {/* HEADER */}
          <DialogHeader className="text-left space-y-4 p-0 min-h-0 mt-6">

            <div className="flex flex-row gap-8 align-middle justify-start" style={{ alignItems: "center" }}>
              <DialogTitle className="text-xl font-semibold w-[90%]">
                {t("profile.confirmLogout")}
              </DialogTitle>
            </div>


            <DialogDescription className="text-sm text-muted-foreground max-w-sm">
              {t("profile.sureLogout")}
            </DialogDescription>
            <div className="rounded-md bg-transparent px-2 py-1 text-sm text-[gray] flex items-startt justify-start gap-2 pl-0">
              <span><Info></Info></span>
              {t("profile.redirectHome")}
            </div>
          </DialogHeader>

          <DialogFooter className="mt-2
            p-0
            flex
            flex-row
            justify-end
            items-center
            gap-2
            min-h-0
            m-0
            pb-4">
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
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2 text-red-400" />
              {t("profile.logOut")}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </>
  );
};