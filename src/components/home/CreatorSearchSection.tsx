import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreatorCountries, useCreatorNiches } from '@/data/mockCreators';
import { Badge } from "@/components/ui/badge";
import CountryPickerModal from "../CountryPickerModal";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const platforms = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook"];

const followerRanges = [
  { label: "Nano (1K-10K)", value: "nano" },
  { label: "Micro (10K-100K)", value: "micro" },
  { label: "Mid (100K-500K)", value: "mid" },
  { label: "Macro (500K-1M)", value: "macro" },
  { label: "Mega (1M+)", value: "mega" },
];

const languagesList = [
  "English", "Spanish", "French", "German", "Portuguese",
  "Italian", "Japanese", "Bulgarian", "Hindi", "Chinese"
];

const engagementRates = [
  { label: "Any", value: "any" },
  { label: "Low (<2%)", value: "low" },
  { label: "Medium (2-5%)", value: "medium" },
  { label: "High (5%+)", value: "high" },
];

const contentTypes = ["Photos", "Reels/Shorts", "Stories", "Long-form Video", "Live Streams"];

const collaborationTypes = [
  "Sponsored Posts", "Product Reviews", "Affiliate",
  "Brand Ambassador", "UGC Content", "Giveaways"
];

const budgetRanges = [
  { label: "Under $100", value: "under 100" },
  { label: "$100 - $500", value: "100-500" },
  { label: "$500 - $1K", value: "500-1k" },
  { label: "$1K - $5K", value: "1k-5k" },
  { label: "$5K+", value: "5k+" },
];

type Props = {
  onSearch: (filters: any) => void;
  onClickSearch: () => void;
  isRegistered: boolean;
};

const CreatorSearchSection = ({ onSearch, onClickSearch, isRegistered }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedCollabTypes, setSelectedCollabTypes] = useState<string[]>([]);
  const [vipAccount, setVipAccount] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [followerRange, setFollowerRange] = useState<string | null>(null);
  const [country, setCountry] = useState<{ code: string; name: string; flag?: string } | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [engagementRate, setEngagementRate] = useState<string>("any");
  const [budgetRange, setBudgetRange] = useState<string | null>(null);
  const { t } = useTranslation();


  const toggleSelection = (item: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const niches = useCreatorNiches();
  const countries = useCreatorCountries();

  const handleSearch = () => {
    if (!isRegistered) {
      onClickSearch();
      return;
    }
    onSearch({
      query: searchQuery,
      niche: selectedNiches,
      platforms: selectedPlatforms,
      followerRange: followerRange,
      country: country?.name,
      language: languages,
      engagementRate: engagementRate,
      contentTypes: selectedContentTypes,
      collabTypes: selectedCollabTypes,
      budgetRange: budgetRange,
      isVIP: vipAccount,
      availableNow: availableNow,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNiches([]);
    setSelectedPlatforms([]);
    setSelectedContentTypes([]);
    setSelectedCollabTypes([]);
    setFollowerRange("");
    setCountry({ code: "", name: "", flag: "" });
    setLanguages([]);
    setEngagementRate("any");
    setBudgetRange(null);
    setVipAccount(false);
    setAvailableNow(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedNiches.length ||
    selectedPlatforms.length ||
    selectedContentTypes.length ||
    selectedCollabTypes.length ||
    followerRange ||
    country ||
    languages ||
    platforms ||
    engagementRate ||
    budgetRange ||
    vipAccount ||
    availableNow;

  const [countryModalOpen, setCountryModalOpen] = useState(false);

  return (
    <section id="search-section" className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl pl-[1rem] pr-[1rem]">
        {/* HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Find Your <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">Perfect Creator</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Search through thousands of verified creators and find the perfect match for your brand
          </p>
        </div>

        <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-4 md:p-8">

            {/* SEARCH BAR - Stacked on Mobile */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-base md:text-lg border-2 border-border focus:border-primary rounded-xl bg-background w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllFilters(!showAllFilters)}
                className="w-full md:w-fit self-end flex items-center justify-center gap-2 h-10"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showAllFilters ? "Simple Search" : "Advanced Filters"}
              </Button>
            </div>

            {/* QUICK FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Niche - Scrollable box for mobile */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">Niche/Category</Label>
                <div className="flex flex-wrap gap-2 max-h-32 md:max-h-24 overflow-y-auto p-3 bg-muted/30 rounded-xl border border-border/50">
                  {niches.map((niche) => (
                    <Badge
                      key={niche}
                      variant={selectedNiches?.includes(niche) ? "default" : "outline"}
                      className="cursor-pointer py-1.5 px-3 active:scale-95 transition-transform"
                      onClick={() => toggleSelection(niche, selectedNiches, setSelectedNiches)}
                    >
                      {niche}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">Platform</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  {platforms.map((platform) => (
                    <Badge
                      key={platform}
                      variant={selectedPlatforms?.includes(platform) ? "default" : "outline"}
                      className="cursor-pointer py-1.5 px-3 active:scale-95 transition-transform"
                      onClick={() => toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Follower Range */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">Follower Range</Label>
                <Select value={followerRange ?? ""} onValueChange={setFollowerRange}>
                  <SelectTrigger className="bg-background border-2 h-12 rounded-xl">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {followerRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* EXTENDED FILTERS */}
            {showAllFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                {/* Country Button - Full width on mobile */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Country</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 border-2 rounded-xl bg-background"
                    onClick={() => setCountryModalOpen(true)}
                  >
                    <span className="truncate">
                      {country?.name || "Select Country"}
                    </span>
                  </Button>
                </div>

                {/* Language - Fixed layout */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Language</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 max-h-32 overflow-y-auto">
                    {languagesList.map((lang) => {
                      const value = lang.toLowerCase();
                      const isSel = languages?.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setLanguages(prev => isSel ? prev.filter(l => l !== value) : [...prev, value])}
                          className={`px-3 py-1 rounded-full text-xs border transition-all active:scale-95 ${isSel ? "bg-primary text-white" : "bg-background text-muted-foreground"
                            }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Engagement */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Engagement Rate</Label>
                  <Select value={engagementRate} onValueChange={setEngagementRate}>
                    <SelectTrigger className="bg-background border-2 h-12 rounded-xl">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      {engagementRates.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* VIP Toggle - Styled as a card for mobile */}
                <div className="md:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="space-y-0.5">
                      <Label htmlFor="vip" className="text-sm font-bold">VIP Creators Only</Label>
                      <p className="text-[11px] text-muted-foreground">Show top-tier verified talent</p>
                    </div>
                    <Switch id="vip" checked={vipAccount} onCheckedChange={setVipAccount} />
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row gap-3 pt-8 mt-6 border-t border-border">
              <Button
                size="lg"
                onClick={handleSearch}
                className="w-full md:flex-1 h-14 bg-gradient-to-r from-primary to-accent text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Creators
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="lg" onClick={clearFilters} className="h-14 rounded-xl text-muted-foreground">
                  <X className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CountryPickerModal
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        selected={country ? [country] : []}
        setSelected={(val) => setCountry(val[0] || null)}
        onSave={() => setCountryModalOpen(false)}
        shouldHaveOverlay={true}
      />
    </section>
  );
};

export default CreatorSearchSection;
