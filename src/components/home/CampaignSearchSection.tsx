import { useState } from "react";
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
};

const CampaignSearchSection = ({ onSearch }: Props) => {
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

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      niches: selectedNiches,
      platforms: selectedPlatforms,
      contentTypes: selectedContentTypes,
      paymentType,
      budgetRange,
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
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Discover <span className="text-primary">Campaigns</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse active brand campaigns and apply to the ones that fit you
            best
          </p>
        </div>

        <Card className="border-2 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            {/* SEARCH BAR */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg border-2 rounded-xl"
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

            {/* QUICK FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* NICHES */}
              <div>
                <Label>Niche</Label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                  {niches.map((niche) => (
                    <Badge
                      key={niche}
                      variant={
                        selectedNiches.includes(niche) ? "default" : "outline"
                      }
                      onClick={() =>
                        toggleSelection(
                          niche,
                          selectedNiches,
                          setSelectedNiches
                        )
                      }
                      className="cursor-pointer"
                    >
                      {niche}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* PLATFORM */}
              <div>
                <Label>Platform</Label>
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
                  {platforms.map((platform) => (
                    <Badge
                      key={platform}
                      variant={
                        selectedPlatforms.includes(platform)
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        toggleSelection(
                          platform,
                          selectedPlatforms,
                          setSelectedPlatforms
                        )
                      }
                      className="cursor-pointer"
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* BUDGET */}
              <div>
                <Label>Budget</Label>
                <Select value={budgetRange} onValueChange={setBudgetRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* EXTENDED FILTERS */}
            {showAllFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                {/* CONTENT TYPE */}
                <div>
                  <Label>Content Type</Label>
                  <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
                    {contentTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={
                          selectedContentTypes.includes(type)
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          toggleSelection(
                            type,
                            selectedContentTypes,
                            setSelectedContentTypes
                          )
                        }
                        className="cursor-pointer"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* PAYMENT TYPE */}
                <div>
                  <Label>Payment Type</Label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* URGENT */}
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={urgentOnly}
                    onCheckedChange={setUrgentOnly}
                  />
                  <Label>Urgent campaigns only</Label>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button size="lg" className="flex-1" onClick={handleSearch}>
                <Search className="w-5 h-5 mr-2" />
                Search Campaigns
              </Button>

              {hasActiveFilters && (
                <Button variant="outline" size="lg" onClick={clearFilters}>
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

export default CampaignSearchSection;
