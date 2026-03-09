import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountryPickerModal from "../CountryPickerModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useCreatorNiches } from "@/data/mockCreators";

/* ------------------ FILTER DATA ------------------ */

const platforms = ["Instagram", "TikTok", "YouTube", "X"];

const contentTypes = [
  "Reels / Shorts",
  "Stories",
  "Photos",
  "Long-form Video",
  "UGC Content",
];

const paymentTypes = [
  { label: "Paid", value: "paid" },
  { label: "Gifted", value: "gifted" },
  { label: "Paid + Gifted", value: "hybrid" },
];

const budgetRanges = [
  { label: "Any", value: "any" },
  { label: "Under $100", value: "under_100" },
  { label: "$100 – $500", value: "100_500" },
  { label: "$500 – $1K", value: "500_1k" },
  { label: "$1K+", value: "1k_plus" },
];

type Props = {
  onSearch: (filters: any) => void;
  onClickSearch: () => void;
  isRegistered: boolean;
};

const CampaignSearchSection = ({ onSearch, onClickSearch, isRegistered }: Props) => {
  const { t } = useTranslation();
  const niches = useCreatorNiches();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(
    []
  );
  const [paymentType, setPaymentType] = useState("any");
  const [budgetRange, setBudgetRange] = useState("any");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [country, setCountry] = useState<{ code: string; name: string } | null>(
    null
  );
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const primaryButtonClass = 'bg-gradient-to-br from-primary to-secondary text-white hover:bg-primary/90';

  const handleSearch = () => {
    if (!isRegistered) {
      onClickSearch();
      return;
    }
    onSearch({
      query: searchQuery,
      niches: selectedNiches,
      platforms: selectedPlatforms,
      contentTypes: selectedContentTypes,
      paymentType,
      budgetRange: budgetRange,
      country: country?.name,
      urgentOnly,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNiches([]);
    setSelectedPlatforms([]);
    setSelectedContentTypes([]);
    setPaymentType("any");
    setBudgetRange("any");
    setCountry(null);
    setUrgentOnly(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedNiches.length ||
    selectedPlatforms.length ||
    selectedContentTypes.length ||
    paymentType !== "any" ||
    budgetRange !== "any" ||
    country ||
    urgentOnly;

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl sm:max-w-ful pl-[1rem] pr-[1rem]">
        {/* HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("mvpCampaignSearchSection.titleFirst")} <span className="text-primary">{t("mvpCampaignSearchSection.titleSecond")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            {t("mvpCampaignSearchSection.subTitle")}
          </p>
        </div>

        <Card className="border-2 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-4 md:p-8">

            {/* SEARCH BAR AREA */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t("mvpCampaignSearchSection.searchButton")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 py-6 text-base md:text-lg border-2 rounded-xl w-full`}
                />
              </div>
            </div>

            {/* QUICK FILTERS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* NICHES - Improved Mobile Scroll */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">{t("mvpCampaignSearchSection.niche")}</Label>
                <div className="flex flex-wrap md:flex-nowrap md:overflow-x-auto gap-2 p-3 bg-muted/30 rounded-xl max-h-40 overflow-y-auto scrollbar-hide">
                  {niches.map((niche) => (
                    <Badge
                      key={niche}
                      variant={selectedNiches.includes(niche) ? "default" : "outline"}
                      onClick={() => toggleSelection(niche, selectedNiches, setSelectedNiches)}
                      className="cursor-pointer whitespace-nowrap py-1.5 px-3 text-xs md:text-sm transition-all active:scale-95"
                    >
                      {niche}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* PLATFORM */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">{t("mvpCampaignSearchSection.platform")}</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-xl">
                  {platforms.map((platform) => (
                    <Badge
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      onClick={() => toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)}
                      className="cursor-pointer py-1.5 px-4 active:scale-95"
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* BUDGET */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">{t("mvpCampaignSearchSection.maxBudget")}</Label>
                <Select value={budgetRange} onValueChange={(val) => setBudgetRange(val)}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllFilters(!showAllFilters)}
              className="w-full flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showAllFilters ? t("mvpCampaignSearchSection.simpleSearch") : t("mvpCampaignSearchSection.advancedSearch")}
            </Button>

            {/* EXTENDED FILTERS */}
            {showAllFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">{t("mvpCampaignSearchSection.contentType")}</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-xl">
                    {contentTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={selectedContentTypes.includes(type) ? "default" : "outline"}
                        onClick={() => toggleSelection(type, selectedContentTypes, setSelectedContentTypes)}
                        className="cursor-pointer py-1.5 active:scale-95"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Payment Type</Label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="flex items-center justify-between md:justify-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 self-end">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">{t("mvpCampaignSearchSection.urgentOnly")}</Label>
                    <p className="text-[12px] text-muted-foreground">{t("mvpCampaignSearchSection.urgentText")}</p>
                  </div>
                  <Switch checked={urgentOnly} onCheckedChange={setUrgentOnly} />
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col md:flex-row gap-3 pt-8 mt-4 border-t">
              <Button
                size="lg"
                className={`w-full md:flex-1 h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 ${primaryButtonClass}`}
                onClick={handleSearch}
              >
                <Search className="w-5 h-5 mr-2" />
                {t("mvpCampaignSearchSection.searchButton")}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={clearFilters}
                  className="w-full md:w-fit text-muted-foreground hover:text-destructive"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t("mvpCampaignSearchSection.resetButton")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CampaignSearchSection;
