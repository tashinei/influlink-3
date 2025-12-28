import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { SearchHeader } from "@/components/creators/SearchHeader";
import { EmptyState } from "@/components/creators/EmptyState";
import { SortOption, ViewMode } from "@/types/creator";
import {
  CampaignData,
  CampaignFilterState,
  defaultCampaignFilters,
} from "@/types/campaigns";

const ITEMS_PER_PAGE = 12;

const SearchCampaigns = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [filters, setFilters] = useState<CampaignFilterState>(
    defaultCampaignFilters
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async (reset = false) => {
    if (reset) setPage(1);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: searchQuery,
          type: filters.type,
          status: filters.status,
          budgetRange: filters.budgetRange,
          page: reset ? 1 : page,
          limit: ITEMS_PER_PAGE,
        }),
      });

      const data = await res.json();

      setCampaigns((prev) =>
        reset ? data.results : [...prev, ...data.results]
      );
      setTotalCount(data.count);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(true);
  }, [searchQuery, filters]);

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
          onOpenFilters={() => {}}
          activeFilterCount={0}
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : campaigns.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {campaigns.length < totalCount && (
              <div className="flex justify-center mt-10">
                <Button onClick={() => fetchCampaigns()}>
                  Load More ({totalCount - campaigns.length})
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            onClearFilters={() => setFilters(defaultCampaignFilters)}
          />
        )}
      </div>
    </div>
  );
};

export default SearchCampaigns;
