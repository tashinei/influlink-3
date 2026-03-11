import { useState, useMemo } from "react";
import { CampaignFilterState } from "@/types/campaigns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Filter, RotateCcw, EyeIcon, EyeOff } from "lucide-react";
import { useCreatorNiches } from "@/data/mockCreators";
import { useMediaQuery } from "@/hooks/use-media.query";

/* ------------------ SHARED DATA (Synced with Search Section) ------------------ */
const platforms = ["Instagram", "TikTok", "YouTube", "X", "Facebook"];

const contentTypes = [
  "Reels / Shorts",
  "Stories",
  "Photos",
  "Long-form Video",
  "UGC Content",
];

const collabTypes = [
  { label: "Paid", value: "paid" },
  { label: "Gifted", value: "gifted" },
  { label: "Paid + Gifted", value: "hybrid" },
];

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
  const [collapsed, setCollapsed] = useState(false);
  const niches = useCreatorNiches();

  const hasActiveFilters = useMemo(() => {
    return (
      filters.niches.length > 0 ||
      filters.platforms.length > 0 ||
      filters.contentTypes.length > 0 ||
      filters.collabTypes.length > 0 ||
      filters.budgetRange !== "any" ||
      filters.country !== null ||
      filters.urgentOnly === true ||
      filters.status !== "any"
    );
  }, [filters]);

  const updateFilter = <K extends keyof CampaignFilterState>(key: K, value: CampaignFilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: "niches" | "platforms" | "contentTypes" | "collabTypes", value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300 z-[5000] lg:z-[51]`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed lg:sticky top-0 right-0 h-full lg:h-[calc(100vh-4rem)] lg:top-8
          w-[85%] sm:w-80 lg:w-72
          bg-white dark:bg-zinc-950 lg:bg-transparent
          border-l dark:border-zinc-800 lg:border-none
          lg:glass-card rounded-none lg:rounded-2xl p-6
          flex flex-col 
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          shadow-2xl lg:shadow-none
          !z-[5000] lg:z-[51]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b lg:border-none">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground tracking-tight">Filters</h2>
          </div>

          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden h-8 w-8">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className={`
          flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 transition-all duration-500 ease-in-out
          ${collapsed ? 'opacity-0 pointer-events-none max-h-0' : 'opacity-100 max-h-full'}
          scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800
        `}>

          {/* Niches */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Niches</Label>
            <div className="flex flex-wrap gap-1.5">
              {niches.map((niche) => (
                <Button
                  key={niche}
                  variant={filters.niches.includes(niche) ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-xs rounded-full"
                  onClick={() => toggleArrayFilter("niches", niche)}
                >
                  {niche}
                </Button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Platforms</Label>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <Button
                  key={p}
                  variant={filters.platforms.includes(p) ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-xs rounded-full"
                  onClick={() => toggleArrayFilter("platforms", p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Types */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Content Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {contentTypes.map((type) => (
                <Button
                  key={type}
                  variant={filters.contentTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-xs rounded-full"
                  onClick={() => toggleArrayFilter("contentTypes", type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Collaboration Type (Payment) */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Collab Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {collabTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={filters.collabTypes.includes(type.value) ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-xs rounded-full"
                  onClick={() => toggleArrayFilter("collabTypes", type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Budget Range</Label>
            <Select
              value={filters.budgetRange || "any"}
              onValueChange={(value) => updateFilter("budgetRange", value)}
            >
              <SelectTrigger className="w-full h-9 text-sm bg-background/50">
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="any">Any Amount</SelectItem>
                <SelectItem value="under_100">Under $100</SelectItem>
                <SelectItem value="100_500">$100 – $500</SelectItem>
                <SelectItem value="500_1k">$500 – $1K</SelectItem>
                <SelectItem value="1k_plus">$1K+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Country</Label>
            <input
              type="text"
              placeholder="Filter by country..."
              value={filters.country ?? ""}
              onChange={(e) => updateFilter("country", e.target.value || null)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background/50 focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold">Urgent Only</Label>
              <p className="text-[10px] text-muted-foreground">Show immediate needs</p>
            </div>
            <Switch 
              checked={filters.urgentOnly} 
              onCheckedChange={(checked) => updateFilter("urgentOnly", checked)} 
            />
          </div>

          {/* Mobile Apply Button */}
          <div className="lg:hidden pt-4 pb-10">
            <Button className="w-full shadow-lg h-11" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};