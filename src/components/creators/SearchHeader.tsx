import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { SortOption, ViewMode } from '@/types/creator';
import { useTranslation } from "@/hooks/useTranslation"; // Using your translation hook
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchHeaderProps {
  type: "creator" | "campaign"; // Added type prop
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export const SearchHeader = ({
  type,
  searchQuery,
  onSearchChange,
  resultCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  activeFilterCount,
}: SearchHeaderProps) => {
  const { t } = useTranslation();
  const isCampaign = type === "campaign";

  // Dynamic Content based on type
  const headerTitle = isCampaign ? "Campaigns" : "Creators";
  const subTitle = isCampaign 
    ? "Find the perfect opportunities to grow your brand and earn" 
    : "Find the perfect influencers for your brand from our marketplace";
  const placeholder = isCampaign
    ? "Search campaigns by brand, niche, or requirement..."
    : "Search creators by name, niche, or location...";

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
          Discover <span className="text-primary">{headerTitle}</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {subTitle}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex w-full pl-12 pr-4 h-14 text-base bg-card/70 backdrop-blur-sm border border-accent/30 focus:border-primary rounded-2xl focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Results Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-accent/10">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{resultCount}</span> {headerTitle.toLowerCase()} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown - Dynamically render options */}
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[180px] bg-card/70 backdrop-blur-sm border-accent/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {isCampaign ? (
                <>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="budget_high">Highest Budget</SelectItem>
                  <SelectItem value="budget_low">Lowest Budget</SelectItem>
                  <SelectItem value="deadline">Closing Soon</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="followers">Most Followers</SelectItem>
                  <SelectItem value="engagement">Top Engagement</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onOpenFilters}
            className="lg:hidden relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};