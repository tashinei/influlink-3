import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import { CreatorCard } from '@/components/creators/CreatorCard';
import { FilterPanel } from '@/components/creators/FilterPanel';
import { SearchHeader } from '@/components/creators/SearchHeader';
import { EmptyState } from '@/components/creators/EmptyState';
import { Creator, FilterState, SortOption, ViewMode } from '@/types/creator';

const ITEMS_PER_PAGE = 12;

export const defaultFilters: FilterState = {
    niche: [],
    platforms: [],
    languages: [],

    contentTypes: [],
    collabTypes: [],

    followerRange: null,
    engagementRate: "any",

    country: null,

    budgetRange: null,

    isVIP: false,
    availableNow: false,
};

import { useLocation } from "react-router-dom";
import { InviteModal } from '@/components/campaigns/InviteModal';
import { useUserStore } from '@/store/useUserStore';
import { useMediaQuery } from '@/hooks/use-media.query';
import { useTranslation } from '@/hooks/useTranslation';
import { Helmet } from 'react-helmet-async';

const SearchResults = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const [creators, setCreators] = useState<Creator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

    const handleOpenInviteModal = (creator: Creator) => {
        setSelectedCreator(creator);
        setIsInviteModalOpen(true);
    };

    const location = useLocation();

    const initialQuery = location.state?.query ?? '';

    const initialFilters = useMemo<FilterState>(() => {
        const incomingFilters = location.state?.filters ?? {};

        // Create a clean object starting with defaults
        const cleaned: FilterState = {
            ...defaultFilters,
            ...incomingFilters,
        };

        if ('language' in cleaned) {
            const legacyVal = (cleaned as any).language;
            if (Array.isArray(legacyVal) && legacyVal.length > 0) {
                cleaned.languages = legacyVal;
            }
            delete (cleaned as any).language;
        }

        return cleaned;
    }, [location.state]);

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [sortBy, setSortBy] = useState<SortOption>('followers');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);


    useEffect(() => {
        if (isDesktop) {
            setIsFilterOpen(true);
        }
        else {
            setIsFilterOpen(false);
        }
    }, [isDesktop])

    const normalizeCreator = (c: any): Creator => {
        let socialLinksObj: Record<string, string> = {};
        try {
            socialLinksObj = typeof c.social_links === 'string'
                ? JSON.parse(c.social_links || '{}')
                : (c.social_links || {});
        } catch (e) {
            socialLinksObj = {};
        }

        const activePlatforms = Object.entries(socialLinksObj)
            .filter(([_, url]) => url && String(url).trim() !== "")
            .map(([platform]) => platform.toLowerCase().trim());
        return {
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
            engagementRate: Number(c.engagement_rate || 0),
            platforms: activePlatforms,
            priceRange: c.budget_min ? `$${c.budget_min}+` : 'N/A',
        };
    };

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

    const { token } = useUserStore();

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
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({
                    query: searchQuery,

                    /* taxonomy */
                    niches: filters.niche,
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
                    languages: filters.languages,

                    /* business */
                    budgetRange: filters.budgetRange,

                    /* flags */
                    isVIP: filters.isVIP,
                    availableNow: filters.availableNow,

                    /* pagination */
                    page: reset ? 1 : page,
                    limit: ITEMS_PER_PAGE,
                    sortBy: sortBy,
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
    }, [searchQuery, filters, sortBy]);

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
        if (filters.platforms.length > 0) count++;
        if (filters.followerRange) count++;
        if (filters.engagementRate !== 'any') count++;
        if (filters.languages.length > 0) count++;
        if (filters.country) count++;
        if (filters.isVIP) count++;
        if (filters.availableNow) count++;
        return count;
    }, [filters]);

    const { t } = useTranslation();

    const seoTitle = useMemo(() => {
        if (searchQuery) {
            return `${t('search.resultsFor')} "${searchQuery}" | InfluLink`;
        }
        return `${t('search.discoverCreators')} | InfluLink`;
    }, [searchQuery, t]);

    const seoDescription = useMemo(() => {
        const count = totalCount > 0 ? totalCount : '...';
        const niche = filters.niche[0] || t('search.allNiches');

        const baseTemplate = t('search.metaDescription');

        return baseTemplate
            .replace('{{count}}', String(count))
            .replace('{{niche}}', niche);
    }, [totalCount, filters.niche, t]);

    return (
        <div className="min-h-screen bg-background relative">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />

                {creators.length === 0 && !isLoading && (
                    <meta name="robots" content="noindex" />
                )}

                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="website" />

                <link rel="canonical" href={`${window.location.origin}/creators/search`} />
            </Helmet>
            <div className="fixed inset-0 gradient-subtle pointer-events-none" />

            <div className="relative container mx-auto px-4 py-6">
                <SearchHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    resultCount={totalCount}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    type='creator'
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onOpenFilters={() => setIsFilterOpen(true)}
                    activeFilterCount={activeFilterCount}
                />

                <div className="flex flex-col lg:flex-row gap-8 mt-8 items-start">
                    {/* 1. Filter Panel */}
                    <FilterPanel
                        filters={filters}
                        onFilterChange={setFilters}
                        onClearFilters={handleClearFilters}
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                    />

                    {/* 2. Main Results */}
                    <main className={`flex-1 w-full transition-all duration-300`}>
                        {isLoading && page === 1 ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                            </div>
                        ) : creators.length > 0 ? (
                            <div className="space-y-10">
                                <div className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}>
                                    {creators.map((creator, index) => (
                                        <CreatorCard
                                            key={creator.id}
                                            creator={creator}
                                            index={index}
                                            onInvite={handleOpenInviteModal}
                                        />
                                    ))}
                                </div>

                                {creators.length < totalCount && (
                                    <div className="flex justify-center pb-10">
                                        <Button
                                            onClick={handleLoadMore}
                                            variant="outline"
                                            disabled={isLoading}
                                            className="min-w-[200px] glass-card"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Load More'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState onClearFilters={handleClearFilters} />
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Floating Filter Trigger */}
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

            {/* Modals */}
            {isInviteModalOpen && selectedCreator && (
                <InviteModal
                    open={isInviteModalOpen}
                    onOpenChange={setIsInviteModalOpen}
                    creator={selectedCreator}
                />
            )}
        </div>
    );
};
export default SearchResults;
