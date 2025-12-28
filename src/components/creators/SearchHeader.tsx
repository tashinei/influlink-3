import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { SortOption, ViewMode } from '@/types/creator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserStore } from '@/store/useUserStore';

interface SearchHeaderProps {
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
  const isBrand = useUserStore((state) => state.accountType) === "brand";
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
          Discover <span className="text-primary">{isBrand ? "Creators" : "Campaigns"}</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Find the perfect influencers for your brand from our marketplace
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search creators by name, niche, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-4 h-14 text-base bg-card/70 backdrop-blur-sm border-accent/30 focus:border-primary rounded-2xl"
          />
        </div>
      </div>

      {/* Results Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{resultCount}</span> {isBrand ? "creators" : "campaigns"} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
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

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[160px] bg-card/70 backdrop-blur-sm border-accent/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="followers">Most Followers</SelectItem>
              <SelectItem value="engagement">Top Engagement</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
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
        </div>
      </div>
    </div>
  );
};
