import { MapPin, LinkIcon, Instagram, Twitter, Youtube, CheckCircle2, MoreHorizontal, Camera, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileData } from "@/types/profile";
import { useState } from "react";

interface ProfileHeaderProps {
  profile: ProfileData;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onChangeProfilePic?: (file: File) => void;
  onEditProfile?: () => void;
}

export const ProfileHeader = ({ profile, isFollowing, onToggleFollow, onChangeProfilePic, onEditProfile }: ProfileHeaderProps) => {
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

  // The presence of onChangeProfilePic means the logged-in user is viewing their own profile.
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
                <AvatarImage src={`http://localhost:3000/uploads/${profile.avatar}`} alt={profile.name} style={{ objectFit: "cover" }} />
                <AvatarFallback className="rounded-[1.7rem] text-2xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>
            <span className="absolute bottom-4 right-2 w-4 h-4 bg-green-500 border-2 border-background rounded-full" aria-label="Online" />

            {/* ✅ Change Profile Pic Button (Only for Owner) */}
            {isOwner && (
              <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 p-1 rounded-full cursor-pointer hover:bg-background/90 transition-colors">
                <Camera className="w-5 h-5 text-primary" />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-2 md:pt-20 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 md:mt-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
                  {profile.verified && (
                    <CheckCircle2 className="w-6 h-6 text-primary fill-[white]" aria-label="Approved" />
                  )}
                  <Badge variant="secondary" className="bg-gradient-to-br from-primary to-secondary text-primary-foreground ml-2 py-1 md:py-2">
                    {profile.type === "creator" ? "Creator" : "Brand"}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-medium mb-2">{profile.niche}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    {profile.location}
                  </div>
                  <a
                    href={profile.socialLinks.website}
                    className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="w-4 h-4" aria-hidden="true" />
                    influ-link.com/{profile.handle.replace('@', '')}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* --- START OF CHANGES --- */}

                {/* Case 1: Viewer (Not Owner) - Show Follow & Contact buttons */}
                {!isOwner ? (
                  <>
                    <Button
                      className={`flex-1 md:flex-none rounded-full px-6 transition-all ${isFollowing
                        ? "bg-muted text-foreground hover:bg-muted/80 border"
                        : "bg-gradient-to-br from-secondary to-primary"
                        }`}
                      variant={isFollowing ? "ghost" : "default"}
                      onClick={onToggleFollow}
                      aria-pressed={isFollowing}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none rounded-full px-6">
                      Get in touch
                    </Button>
                  </>
                ) : (
                  // Case 2: Owner - Show Edit Profile button
                  <Button
                    variant="default"
                    className="flex-1 md:flex-none rounded-full px-6 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition duration-300 ease-in-out"
                    // You would replace the onClick with navigation to your Edit Profile route/modal
                    onClick={onEditProfile}
                  >
                    <UserCog className="w-5 h-5 m-0" />
                    Edit Profile
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="More options">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>

                {/* --- END OF CHANGES --- */}
              </div>
            </div>

            {/* Bio & Stats */}
            <div className="flex flex-col md:flex-row gap-8 justify-between border-t border-border pt-6">
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
                  <p className="text-2xl font-bold text-foreground">{profile.stats.followers}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">{profile.stats.engagementRate}</p>
                  <p className="text-sm text-muted-foreground">Eng. Rate</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">{profile.stats.totalReach}</p>
                  <p className="text-sm text-muted-foreground">Reach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};