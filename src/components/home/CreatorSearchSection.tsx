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
  onClickSearch: ()=>void;
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
    <section id="search-section" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Your <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">Perfect Creator</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search through thousands of verified creators and find the perfect match for your brand
          </p>
        </div>

        <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            {/* Main Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search creators by name, niche, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-border focus:border-primary rounded-xl bg-background"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllFilters(!showAllFilters)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                {showAllFilters ? "Less Filters" : "More Filters"}
              </Button>
            </div>

            {/* Quick Filters - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Niche/Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Niche/Category</Label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                  {niches.map((niche) => (
                    <Badge
                      key={niche}
                      variant={selectedNiches?.includes(niche) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${selectedNiches?.includes(niche)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-primary/10"
                        }`}
                      onClick={() => toggleSelection(niche, selectedNiches, setSelectedNiches)}
                    >
                      {niche}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Platform</Label>
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
                  {platforms.map((platform) => (
                    <Badge
                      key={platform}
                      variant={selectedPlatforms?.includes(platform) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${selectedPlatforms?.includes(platform)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-primary/10"
                        }`}
                      onClick={() => toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Follower Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Follower Range</Label>
                <Select value={followerRange ?? ""} onValueChange={setFollowerRange}>
                  <SelectTrigger className="bg-background border-2">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {followerRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Extended Filters */}
            {showAllFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 pt-6 border-t border-border">
                {/* Country */}
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Country</Label>
                    <div
                      onClick={() =>
                        setCountryModalOpen(true)
                      }
                      className="mt-2 py-2 px-3 group justify-center cursor-pointer border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md flex flex-wrap gap-2 items-center transition-colors"
                    >

                      <span className={`text-sm flex items-center gap-2 ${country ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {(country != null && country.name != "") ? country.name : t("form.placeholders.selectOneCountry") || "+ Изберете държава"}
                      </span>
                    </div>
                  </div>
                  <CountryPickerModal
                    open={countryModalOpen}
                    onClose={() => setCountryModalOpen(false)}
                    selected={country != null ? [country] : []}
                    setSelected={(val: { code: string; name: string; flag?: string }[]) =>
                      setCountry(val[0] || null)
                    }
                    onSave={() => setCountryModalOpen(false)}
                    shouldHaveOverlay={false}
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Language</Label>

                  <div className="flex flex-wrap gap-2 border-2 rounded-md p-2 bg-background">
                    {languagesList.map((lang) => {
                      const value = lang.toLowerCase();
                      const selected = languages?.includes(value);

                      console.log("Selected languages:", languages);

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setLanguages((prev) =>
                              selected
                                ? prev.filter((l) => l !== value)
                                : [...prev, value]
                            );
                          }}
                          className={`
            px-3 py-1 rounded-full text-sm border transition
            ${selected
                              ? "bg-primary text-white border-primary"
                              : "bg-muted text-muted-foreground hover:bg-accent"}
          `}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Engagement Rate */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Engagement Rate</Label>
                  <Select
                    value={engagementRate} // bind to state
                    onValueChange={(value) =>
                      setEngagementRate(value)
                    }
                  >
                    <SelectTrigger className="bg-background border-2">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {engagementRates.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value}>
                          {rate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Content Type</Label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                    {contentTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={selectedContentTypes?.includes(type) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${selectedContentTypes?.includes(type)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-primary/10"
                          }`}
                        onClick={() => toggleSelection(type, selectedContentTypes, setSelectedContentTypes)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Collaboration Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Collaboration Type</Label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                    {collaborationTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={selectedCollabTypes?.includes(type) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${selectedCollabTypes?.includes(type)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-primary/10"
                          }`}
                        onClick={() => toggleSelection(type, selectedCollabTypes, setSelectedCollabTypes)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Budget Range</Label>
                  <Select value={budgetRange ?? ""} onValueChange={setBudgetRange}>
                    <SelectTrigger className="bg-background border-2">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {budgetRanges.map((budget) => (
                        <SelectItem key={budget.value} value={budget.value}>
                          {budget.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggle Options */}
                <div className="space-y-4 lg:col-span-3 flex flex-wrap gap-8 pt-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="vip"
                      checked={vipAccount}
                      onCheckedChange={setVipAccount}
                    />
                    <Label htmlFor="vip" className="text-sm font-medium cursor-pointer">
                      VIP Creators Only
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Button
                size="lg"
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground rounded-xl shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Creators
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={clearFilters}
                  className="rounded-xl"
                >
                  <X className="w-5 h-5 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreatorSearchSection;
