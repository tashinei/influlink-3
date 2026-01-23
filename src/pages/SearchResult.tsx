import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { CreatorCard } from '@/components/creators/CreatorCard';
import { FilterPanel } from '@/components/creators/FilterPanel';
import { SearchHeader } from '@/components/creators/SearchHeader';
import { EmptyState } from '@/components/creators/EmptyState';
import { Creator, FilterState, SortOption, ViewMode } from '@/types/creator';

const ITEMS_PER_PAGE = 12;

export const defaultFilters: FilterState = {
    niche: [],
    platforms: [],

    contentTypes: [],
    collabTypes: [],

    followerRange: null,
    engagementRate: "any",

    country: null,
    language: [],

    budgetRange: null,

    isVIP: false,
    availableNow: false,
};

import { useLocation } from "react-router-dom";
import { InviteModal } from '@/components/campaigns/InviteModal';

const SearchResults = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const [creators, setCreators] = useState<Creator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

    const handleOpenInviteModal = (creator: Creator) => {
        setSelectedCreator(creator);
        setIsInviteModalOpen(true);
    };

    const location = useLocation();

    const initialQuery = location.state?.query ?? '';

    const initialFilters = useMemo<FilterState>(() => ({
        ...defaultFilters,
        ...(location.state?.filters ?? {}),
    }), [location.state]);

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [sortBy, setSortBy] = useState<SortOption>('followers');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const normalizeCreator = (c: any): Creator => ({
        id: c.id.toString(),
        handle: c.handle,
        name: c.name || 'Unknown',
        username: c.handle || '',
        avatar: c.avatar || '/default-avatar.png',
        bio: c.bio || '',
        niche: c.niche || 'General',
        location: c.location || '',
        isVIP: c.isVip === 1,
        followers: Number(c.followers || 0),
        engagementRate: Number(c.engagementRate?.replace('%', '') || 0),
        platforms: Array.isArray(c.platforms) ? c.platforms : [],
        priceRange: c.priceRange || 'N/A',
    });

    useEffect(() => {
        console.log("Applied filters:", filters);
    }, [filters]);

    const mapFollowerRange = (range: FilterState["followerRange"]) => {
        switch (range) {
            case "nano":
                return { minFollowers: 1000, maxFollowers: 10000 };
            case "micro":
                return { minFollowers: 10000, maxFollowers: 100000 };
            case "mid":
                return { minFollowers: 100000, maxFollowers: 500000 };
            case "macro":
                return { minFollowers: 500000, maxFollowers: 1000000 };
            case "mega":
                return { minFollowers: 1000000, maxFollowers: 10000000 }; // instead of null
            default:
                return { minFollowers: 0, maxFollowers: 10000000 }; // instead of null
        }
    };


    const mapEngagementRate = (
        rate: "low" | "medium" | "high" | "any" | null | undefined
    ): { minEngagement: number; maxEngagement: number } => {
        switch (rate) {
            case "low":
                return { minEngagement: 0, maxEngagement: 2 };

            case "medium":
                return { minEngagement: 2, maxEngagement: 5 };

            case "high":
                return { minEngagement: 5, maxEngagement: 100 };

            case "any":
            default:
                return { minEngagement: 0, maxEngagement: 100 };
        }
    };


    // Fetch creators from backend
    const fetchCreators = async (reset = false) => {
        if (reset) setPage(1);
        setIsLoading(true);

        const { minFollowers, maxFollowers } = mapFollowerRange(
            filters.followerRange
        );

        const { minEngagement, maxEngagement } = mapEngagementRate(
            filters.engagementRate
        );

        try {
            const res = await fetch(`${API_BASE_URL}/creators/search`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: searchQuery,

                    /* taxonomy */
                    niche: filters.niche,
                    platforms: filters.platforms,
                    contentTypes: filters.contentTypes,
                    collabTypes: filters.collabTypes,

                    /* audience */
                    minFollowers: minFollowers,
                    maxFollowers: maxFollowers,
                    minEngagement: minEngagement,
                    maxEngagement: maxEngagement,

                    /* geo */
                    country: filters.country,
                    language: filters.language,

                    /* business */
                    budgetRange: filters.budgetRange,

                    /* flags */
                    isVIP: filters.isVIP,
                    availableNow: filters.availableNow,

                    /* pagination */
                    page: reset ? 1 : page,
                    limit: ITEMS_PER_PAGE,
                }),
            });

            const data = await res.json();
            const normalized = data.results.map(normalizeCreator);

            setCreators(prev =>
                reset ? normalized : [...prev, ...normalized]
            );

            setTotalCount(data.count);
        } catch (err) {
            console.error("Failed to fetch creators:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch when filters/search change
    useEffect(() => {
        fetchCreators(true);
    }, [searchQuery, filters]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        fetchCreators();
    };

    const handleClearFilters = () => {
        setFilters(defaultFilters);
        setSearchQuery('');
        setPage(1);
        fetchCreators(true);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.niche.length > 0) count++;
        if (filters.isVIP) count++;
        if (filters.availableNow) count++;
        return count;
    }, [filters]);

    return (
        <>
            <div className="min-h-screen bg-background">
                <div className="fixed inset-0 gradient-subtle pointer-events-none" />

                <div className="relative container mx-auto px-4 py-6">
                    <SearchHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        resultCount={totalCount}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onOpenFilters={() => setIsFilterOpen(true)}
                        activeFilterCount={activeFilterCount}
                    />

                    <div className="flex gap-8 mt-8">
                        {/* Desktop Filter Panel */}
                        <div className="hidden lg:block flex-shrink-0">
                            <FilterPanel
                                filters={filters}
                                onFilterChange={setFilters}
                                onClearFilters={handleClearFilters}
                                isOpen={isFilterOpen}
                                onClose={() => setIsFilterOpen(false)}
                            />
                        </div>

                        {/* Results */}
                        <div className="flex-1">
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                </div>
                            ) : creators.length > 0 ? (
                                <>
                                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                        {creators.map((creator, index) => (
                                            <CreatorCard key={creator.id} creator={creator} index={index} onInvite={(creator) => handleOpenInviteModal(creator)} />
                                        ))}
                                    </div>

                                    {creators.length < totalCount && (
                                        <div className="flex justify-center mt-10">
                                            <Button onClick={handleLoadMore} size="lg" className="min-w-[200px]">
                                                Load More ({totalCount - creators.length} remaining)
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <EmptyState onClearFilters={handleClearFilters} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Panel */}
                <div className='lg:hidden'>
                    <FilterPanel
                        filters={filters}
                        onFilterChange={setFilters}
                        onClearFilters={handleClearFilters}
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                    />
                </div>
            </div>
            {isInviteModalOpen && selectedCreator && (
                <InviteModal
                    open={isInviteModalOpen} // Changed 'isOpen' to 'open'
                    onOpenChange={setIsInviteModalOpen}
                    creator={selectedCreator}
                // onClose isn't used in your Modal definition, 
                // but onOpenChange handles it.
                />
            )}
        </>
    );
};

export default SearchResults;
