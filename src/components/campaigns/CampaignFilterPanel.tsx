import { useState, useMemo } from "react";
import { CampaignFilterState } from "@/types/campaigns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Filter, RotateCcw, ChevronDown, ChevronUp, EyeIcon, EyeClosed, EyeOff } from "lucide-react";
import { useCreatorNiches } from "@/data/mockCreators";

interface CampaignFilterPanelProps {
  filters: CampaignFilterState;
  onFilterChange: (filters: CampaignFilterState) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignFilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose,
}: CampaignFilterPanelProps) => {
  const [collapsed, setCollapsed] = useState(false); // <-- collapsed state

  const updateFilter = <K extends keyof CampaignFilterState>(key: K, value: CampaignFilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.niches.length > 0 ||
      filters.platforms.length > 0 ||
      filters.contentTypes.length > 0 ||
      filters.collabTypes.length > 0 ||
      filters.budgetRange !== null ||
      filters.country !== null ||
      filters.language.length > 0 ||
      filters.status !== "any"
    );
  }, [filters]);

  if (!isOpen) return null;

  const niches = useCreatorNiches();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed lg:sticky top-0 right-0 lg:right-auto h-full lg:h-auto lg:top-6
          w-80 lg:w-72 glass-card rounded-2xl p-6 z-40
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          overflow-y-auto max-h-screen lg:max-h-[calc(100vh-3rem)]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Filters</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}

            {/* Collapse/Expand toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <EyeIcon className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Collapsible content */}
        <div className={`transition-all duration-300 ${collapsed ? 'max-h-0 overflow-hidden' : 'max-h-[2000px]'}`}>
          {/* Niches */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Niches</Label>
            <div className="flex flex-wrap gap-2">
              {niches.map((niche) => {
                const selected = filters.niches.includes(niche);
                return (
                  <Button
                    key={niche}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateFilter(
                        "niches",
                        selected
                          ? filters.niches.filter((n) => n !== niche)
                          : [...filters.niches, niche]
                      )
                    }
                  >
                    {niche}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {["Instagram", "TikTok", "YouTube", "Twitch"].map((platform) => {
                const selected = filters.platforms.includes(platform);
                return (
                  <Button
                    key={platform}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateFilter(
                        "platforms",
                        selected
                          ? filters.platforms.filter((p) => p !== platform)
                          : [...filters.platforms, platform]
                      )
                    }
                  >
                    {platform}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content Types */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Content Types</Label>
            <div className="flex flex-wrap gap-2">
              {["Reels", "Stories", "Posts", "Lives"].map((type) => {
                const selected = filters.contentTypes.includes(type);
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateFilter(
                        "contentTypes",
                        selected
                          ? filters.contentTypes.filter((t) => t !== type)
                          : [...filters.contentTypes, type]
                      )
                    }
                  >
                    {type}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Collaboration Types */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Collaboration Type</Label>
            <div className="flex flex-wrap gap-2">
              {["Sponsored", "Affiliate", "UGC", "Brand Ambassador"].map((type) => {
                const selected = filters.collabTypes.includes(type);
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateFilter(
                        "collabTypes",
                        selected
                          ? filters.collabTypes.filter((t) => t !== type)
                          : [...filters.collabTypes, type]
                      )
                    }
                  >
                    {type}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Budget Range</Label>
            <Select
              value={filters.budgetRange ?? "any"}
              onValueChange={(value) =>
                updateFilter("budgetRange", value === "any" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="low">$0 – $100</SelectItem>
                <SelectItem value="mid">$100 – $1,000</SelectItem>
                <SelectItem value="high">$1,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Country</Label>
            <input
              type="text"
              placeholder="Any"
              value={filters.country ?? ""}
              onChange={(e) => updateFilter("country", e.target.value || null)}
              className="w-full border rounded-md px-3 py-2 bg-background"
            />
          </div>
        </div>
      </aside>
    </>
  );
};
