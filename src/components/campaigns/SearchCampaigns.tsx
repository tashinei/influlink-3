import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { SearchHeader } from "@/components/creators/SearchHeader";
import { EmptyState } from "@/components/creators/EmptyState";
import { SortOption, ViewMode } from "@/types/creator";
import { FilterPanel } from "../creators/FilterPanel";
import {
  CampaignData,
  CampaignFilterState,
  defaultCampaignFilters,
} from "@/types/campaigns";
import { CampaignFilterPanel } from "./CampaignFilterPanel";
import { useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 12;

const SearchCampaigns = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  /**
   * Initial values from navigation state
   */
  const initialQuery = location.state?.query ?? "";

  const initialFilters = useMemo<CampaignFilterState>(
    () => ({
      ...defaultCampaignFilters,
      ...(location.state?.filters ?? {}),
    }),
    [location.state]
  );

  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const fetchCampaigns = async (reset = false) => {
    const currentPage = reset ? 1 : page;

    if (reset) {
      setCampaigns([]);
      setPage(1);
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: searchQuery,

          niches: filters.niches,
          platforms: filters.platforms,
          contentTypes: filters.contentTypes,
          collabTypes: filters.collabTypes,

          country: filters.country,
          language: filters.language,

          budgetRange: filters.budgetRange,

          status: filters.status === "any" ? null : filters.status,

          sortBy,

          page: reset ? 1 : page,
          limit: ITEMS_PER_PAGE,
        }),

      });

      const data = await res.json();

      setCampaigns((prev) =>
        reset ? data.results : [...prev, ...data.results]
      );
      setTotalCount(data.count);

      if (!reset) {
        setPage((p) => p + 1);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [filters, setFilters] = useState<CampaignFilterState>(
    initialFilters
  );
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    fetchCampaigns(true);
  }, [searchQuery, filters, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.niches.length) count++;
    if (filters.platforms.length) count++;
    if (filters.contentTypes.length) count++;
    if (filters.collabTypes.length) count++;
    if (filters.language.length) count++;
    if (filters.country) count++;
    if (filters.budgetRange) count++;
    if (filters.status !== "any") count++;

    return count;
  }, [filters]);

  const handleClearFilters = () => {
    setFilters(defaultCampaignFilters);
    setPage(1);
    fetchCampaigns(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultCount={totalCount}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenFilters={() => { }}
          activeFilterCount={activeFilterCount}
        />

        <div className="flex gap-8 mt-8">
          {/* Desktop filters */}
          <div className="hidden lg:block flex-shrink-0">
            <CampaignFilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {isLoading && campaigns.length === 0 ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : campaigns.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>

                {campaigns.length < totalCount && (
                  <div className="flex justify-center mt-10">
                    <Button onClick={() => fetchCampaigns()} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading…
                        </>
                      ) : (
                        `Load More (${totalCount - campaigns.length})`
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState onClearFilters={handleClearFilters} />
            )}
          </div>
        </div>

        {/* Mobile filters */}
        <div className="lg:hidden">
          <CampaignFilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
        </div>

      </div>
    </div>
  );
};

export default SearchCampaigns;
