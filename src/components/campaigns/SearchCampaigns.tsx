import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Filter } from "lucide-react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { SearchHeader } from "@/components/creators/SearchHeader";
import { EmptyState } from "@/components/creators/EmptyState";
import { SortOption, ViewMode } from "@/types/creator";
import {
  CampaignData,
  CampaignFilterState,
  defaultCampaignFilters,
} from "@/types/campaigns";
import { CampaignFilterPanel } from "./CampaignFilterPanel";
import { useLocation } from "react-router-dom";
import { CampaignApplyDialog } from "./CampaignApplyModal";
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Helmet } from "react-helmet-async";

const ITEMS_PER_PAGE = 12;

const SearchCampaigns = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();

  // --- States ---
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile drawer state
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // --- Filter Initialization ---
  const initialQuery = location.state?.query ?? "";
  const initialFilters = useMemo<CampaignFilterState>(
    () => {
      const merged = {
        ...defaultCampaignFilters,
        ...(location.state?.filters ?? {}),
      };

      if (!Array.isArray(merged.country)) {
        merged.country = merged.country ? [merged.country] : [];
      }
      if (!Array.isArray(merged.countryCode)) {
        merged.countryCode = merged.countryCode ? [merged.countryCode] : [];
      }

      return merged;
    },
    [location.state]
  );

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<CampaignFilterState>(initialFilters);

  // --- Memoized Values ---
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.niches.length) count++;
    if (filters.platforms.length) count++;
    if (filters.contentTypes.length) count++;
    if (filters.collabTypes.length) count++;
    if (filters.language.length) count++;
    if (filters.country.length) count++;
    if (filters.budgetRange) count++;
    if (filters.status !== "any") count++;
    return count;
  }, [filters]);

  // --- API Calls ---
  const fetchCampaigns = async (reset = false) => {
    const targetPage = reset ? 1 : page;
    if (reset) {
      setCampaigns([]);
      setPage(1);
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          query: searchQuery,
          ...filters,
          status: filters.status === "any" ? null : filters.status,
          country: filters.country.filter(c => c && c.trim()),
          countryCode: filters.countryCode.filter(c => c && c.trim()),
          sortBy,
          page: targetPage,
          limit: ITEMS_PER_PAGE,
        }),
      });

      const data = await res.json();
      setCampaigns((prev) => (reset ? data.results : [...prev, ...data.results]));
      setTotalCount(data.count);
      if (!reset) setPage((p) => p + 1);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchCampaigns(true);
  }, [searchQuery, filters, sortBy]);

  // --- Handlers ---
  const handleClearFilters = () => {
    setFilters(defaultCampaignFilters);
  };

  const handleApplyClick = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      setApplyModalOpen(true);
    }
  };

  const { t } = useTranslation();

  const sortOptions = [
    { value: "recent", label: t("sort.recent") }, // "Recently Added"
    { value: "budget_high", label: t("sort.budgetHigh") }, // "Highest Budget"
    { value: "budget_low", label: t("sort.budgetLow") }, // "Lowest Budget"
    { value: "deadline", label: t("sort.deadline") }, // "Closing Soon"
  ];

  const seoTitle = useMemo(() => {
    if (searchQuery) {
      return `${t("campaigns.resultsFor")} "${searchQuery}" | InfluLink`;
    }
    return `${t("campaigns.discoverTitle")} | InfluLink`;
  }, [searchQuery, t]);

  const seoDescription = useMemo(() => {
    const count = totalCount > 0 ? totalCount : "...";
    const niche = filters.niches[0] || t("campaigns.allNiches");
    const baseTemplate = t("campaigns.metaDescription");

    return baseTemplate
      .replace("{{count}}", String(count))
      .replace("{{niche}}", niche);
  }, [totalCount, filters.niches, t]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />

        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />

        {/* Prevent indexing if no campaigns are found */}
        {campaigns.length === 0 && !isLoading && (
          <meta name="robots" content="noindex" />
        )}

        <link rel="canonical" href={window.location.origin + location.pathname} />
      </Helmet>
      <div className="container mx-auto px-4 py-6">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultCount={totalCount}
          sortBy={sortBy}
          type="campaign"
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenFilters={() => setIsFilterOpen(true)} // Fix: Now opens mobile filters
          activeFilterCount={activeFilterCount}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8 relative">
          {/* Desktop Sidebar (Fixed Position) */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 h-fit">
            <CampaignFilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              isOpen={true}
              onClose={() => { }}
            />
          </aside>

          {/* Results Grid */}
          <main className="flex-1 min-w-0">
            {isLoading && campaigns.length === 0 ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
              </div>
            ) : campaigns.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-4"
                  }
                >
                  {campaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onApply={handleApplyClick}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {campaigns.length < totalCount && (
                  <div className="flex justify-center mt-12 mb-20 lg:mb-0">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fetchCampaigns()}
                      disabled={isLoading}
                      className="min-w-[200px]"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
          </main>
        </div>

        {/* Mobile Floating Filter Trigger (Optional) */}
        {!isFilterOpen && (
          <div className="fixed bottom-6 right-6 lg:hidden z-40">
            <Button
              onClick={() => setIsFilterOpen(true)}
              className="rounded-full h-14 w-14 shadow-2xl p-0 bg-gradient-to-tl from-primary via-secondary to-tertiary"
            >
              <div className="relative">
                <Filter className="!w-6 !h-6" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 to-tertiary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                    {activeFilterCount}
                  </span>
                )}
              </div>
            </Button>
          </div>
        )}

        {/* Mobile Sidebar (Drawer Mode) */}
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

      {/* Modals */}
      {selectedCampaign && (
        <CampaignApplyDialog
          open={applyModalOpen}
          onOpenChange={setApplyModalOpen}
          campaign={{
            ...selectedCampaign,
            id: Number(selectedCampaign.id)
          }}
        />
      )}
    </div>
  );
};

export default SearchCampaigns;