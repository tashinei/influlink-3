import { useState } from "react";
import { 
  MapPin, 
  Link as LinkIcon, 
  Instagram, 
  Twitter, 
  Youtube, 
  CheckCircle2, 
  Mail, 
  MoreHorizontal,
  Heart,
  Eye,
  MessageCircle,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data simulating a Creator Profile
const MOCK_PROFILE = {
  name: "Sarah Jenkins",
  handle: "@sarah.creates",
  type: "creator", // or 'brand'
  niche: "Lifestyle & Travel",
  location: "Los Angeles, CA",
  verified: true,
  bio: "Digital creator passionate about sustainable travel and eco-friendly lifestyle. Creating content that inspires wanderlust while respecting the planet.",
  stats: {
    followers: "125K",
    following: "450",
    engagementRate: "4.8%",
    totalReach: "1.2M"
  },
  portfolio: [
    {
      id: 1,
      title: "Summer Campaign 2024",
      brand: "Ocean Co.",
      type: "Reels • TikTok",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60",
      stats: { likes: "12K", views: "450K" }
    },
    {
      id: 2,
      title: "Eco-Travel Guide",
      brand: "Visit Norway",
      type: "Blog • Instagram",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60",
      stats: { likes: "8.5K", views: "120K" }
    },
    {
      id: 3,
      title: "Sustainable Fashion Haul",
      brand: "Everlane",
      type: "YouTube Integration",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60",
      stats: { likes: "25K", views: "800K" }
    }
  ]
};

const Profile = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* 1. Header / Cover Area */}
      {/* Used a soft gradient similar to your HeroSection to match the theme */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden bg-gradient-to-r from-secondary via-[#90d5f3ff] to-primary">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        {/* Decorative blurring orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-primary to-secondary blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-secondary to-primary blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* 2. Profile Info Section */}
        <div className="relative -mt-20 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Avatar - Large squircle shape like the reference */}
            <div className="relative group">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] p-1.5 bg-white shadow-xl rotate-0 transition-transform group-hover:rotate-3">
                <Avatar className="h-full w-full rounded-[1.7rem]">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60" className="object-cover" />
                  <AvatarFallback className="rounded-[1.7rem] text-2xl">SJ</AvatarFallback>
                </Avatar>
              </div>
              {/* Online Status Dot */}
              <span className="absolute bottom-4 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            {/* Info Block */}
            <div className="flex-1 pt-2 md:pt-20 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Name & Bio */}
                <div>
                  <div className="flex items-center gap-2 mb-1 md:mt-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{MOCK_PROFILE.name}</h1>
                    {MOCK_PROFILE.verified && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-50" />
                    )}
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 ml-2">
                      {MOCK_PROFILE.type === 'creator' ? 'Creator' : 'Brand'}
                    </Badge>
                  </div>
                  <p className="text-gray-500 font-medium mb-2">{MOCK_PROFILE.niche}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {MOCK_PROFILE.location}
                    </div>
                    <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                      <LinkIcon className="w-4 h-4" />
                      influ-link.com/sarah
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button 
                    className={`flex-1 md:flex-none rounded-full px-6 transition-all ${isFollowing ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : ''}`}
                    variant={isFollowing ? "ghost" : "default"}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" className="flex-1 md:flex-none rounded-full px-6 border-gray-300">
                    Get in touch
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </Button>
                </div>
              </div>

              {/* Bio & Socials */}
              <div className="flex flex-col md:flex-row gap-8 justify-between border-t border-gray-100 pt-6">
                <div className="max-w-xl">
                  <p className="text-gray-600 leading-relaxed">
                    {MOCK_PROFILE.bio}
                  </p>
                  <div className="flex gap-4 mt-4">
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-pink-600 hover:scale-110 transition-transform cursor-pointer">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-black hover:scale-110 transition-transform cursor-pointer">
                      <Twitter className="w-5 h-5" />
                    </div>
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-red-600 hover:scale-110 transition-transform cursor-pointer">
                      <Youtube className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-8 md:gap-12">
                  <div className="text-center md:text-left">
                    <p className="text-2xl font-bold text-gray-900">{MOCK_PROFILE.stats.followers}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-2xl font-bold text-gray-900">{MOCK_PROFILE.stats.engagementRate}</p>
                    <p className="text-sm text-gray-500">Eng. Rate</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-2xl font-bold text-gray-900">{MOCK_PROFILE.stats.totalReach}</p>
                    <p className="text-sm text-gray-500">Reach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Tabs & Content Grid */}
        <Tabs defaultValue="portfolio" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b border-gray-200 w-full justify-start rounded-none">
              <TabsTrigger 
                value="portfolio" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-3 text-base text-gray-500 px-0"
              >
                Portfolio
                <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600 text-xs">12</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="moodboards" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-3 text-base text-gray-500 px-0"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-3 text-base text-gray-500 px-0"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="portfolio" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PROFILE.portfolio.map((item) => (
                <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-3xl">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-sm">
                          {item.type}
                        </Badge>
                      </div>
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white">
                        <div className="flex items-center gap-1">
                          <Heart className="w-5 h-5 fill-current" />
                          <span className="font-semibold">{item.stats.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-5 h-5" />
                          <span className="font-semibold">{item.stats.views}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                          <Share2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="moodboards">
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
              <p>Analytics content visible to Brand partners only.</p>
              <Button variant="link">Request Access</Button>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Profile;