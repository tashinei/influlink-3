import { useState, useMemo } from "react";
import { CampaignFilterState } from "@/types/campaigns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Filter, RotateCcw, EyeIcon, EyeOff } from "lucide-react";
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
  // 1.Hooks винаги най-отгоре (преди всякакви return клаузи)
  const [collapsed, setCollapsed] = useState(false);
  const niches = useCreatorNiches();

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

  const updateFilter = <K extends keyof CampaignFilterState>(key: K, value: CampaignFilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  // 2. Проверка за рендиране СЛЕД хуковете
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay - фиксиран за мобилни */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden animate-in fade-in duration-300"
        onClick={onClose}
      />

      <aside
        className={`
          /* Позициониране */
          fixed lg:sticky top-0 right-0 h-full lg:h-auto lg:top-6 z-[51]
          w-[85%] sm:w-80 lg:w-72
          
          /* Стил и Фон */
          bg-white dark:bg-zinc-950 lg:bg-transparent
          border-l dark:border-zinc-800 lg:border-none
          lg:glass-card rounded-none lg:rounded-2xl p-6
          
          /* Анимация и Скрол */
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          overflow-y-auto max-h-screen lg:max-h-[calc(100vh-3rem)]
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-inherit z-10 pb-2 pt-2 border-b lg:border-none">
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
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
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
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden h-8 w-8">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Collapsible content */}
        <div className={`
          space-y-6 transition-all duration-500 ease-in-out
          ${collapsed ? 'opacity-0 pointer-events-none max-h-0' : 'opacity-100 max-h-[2000px]'}
        `}>
          {/* Niches */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Niches</Label>
            <div className="flex flex-wrap gap-2">
              {niches.map((niche) => {
                const selected = filters.niches.includes(niche);
                return (
                  <Button
                    key={niche}
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full px-4 ${selected ? 'shadow-md shadow-primary/20' : ''}`}
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
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {["Instagram", "TikTok", "YouTube", "Twitch"].map((platform) => {
                const selected = filters.platforms.includes(platform);
                return (
                  <Button
                    key={platform}
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    className="rounded-full px-4"
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

          {/* Budget */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Budget Range
            </Label>
            <Select
              value={filters.budgetRange ?? "any"}
              onValueChange={(value) =>
                updateFilter("budgetRange", value === "any" ? null : value)
              }
            >
              <SelectTrigger className="w-full bg-background/50">
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>

              {/* ДОБАВИ ТОВА ТУК: */}
              <SelectContent className="z-[100]">
                <SelectItem value="any">Any Amount</SelectItem>
                <SelectItem value="low">$0 – $100</SelectItem>
                <SelectItem value="mid">$100 – $1,000</SelectItem>
                <SelectItem value="high">$1,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Country</Label>
            <input
              type="text"
              placeholder="Filter by country..."
              value={filters.country ?? ""}
              onChange={(e) => updateFilter("country", e.target.value || null)}
              className="w-full border rounded-md px-3 py-2 bg-background/50 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Mobile Bottom Action - фиксиран бутон за мобилни */}
          <div className="lg:hidden pt-4 pb-10">
            <Button className="w-full shadow-lg" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};