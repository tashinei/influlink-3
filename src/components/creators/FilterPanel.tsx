import { FilterState } from '@/types/creator';
import { useCreatorNiches } from '@/data/mockCreators';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FOLLOWER_PRESETS } from '@/types/followers';
import { ENGAGEMENT_PRESETS } from '@/types/followers';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Filter, RotateCcw } from 'lucide-react';
import { formatFollowers } from '@/utils/formatters';
import { useState } from "react";
import CountryPickerModal from '../CountryPickerModal';

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClearFilters: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export const FilterPanel = ({
    filters,
    onFilterChange,
    onClearFilters,
    isOpen,
    onClose,
}: FilterPanelProps) => {
    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };
    const [countryModalOpen, setCountryModalOpen] = useState(false);

    const niches = useCreatorNiches();

    const followerPreset = filters.followerRange
        ? FOLLOWER_PRESETS[filters.followerRange]
        : { min: 0, max: 10_000_000 };

    const hasActiveFilters =
        filters.niche.length > 0 ||
        filters.followerRange ||
        filters.isVIP ||
        filters.country ||
        filters.language;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Filter Panel */}
            <aside
                className={`
          fixed lg:sticky top-0 right-0 lg:right-auto h-full lg:h-auto lg:top-6
          w-80 lg:w-72 glass-card rounded-none lg:rounded-2xl p-6 z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          lg:transform-none overflow-y-auto max-h-screen lg:max-h-[calc(100vh-3rem)]
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
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Niche */}
                <div className="space-y-3 mb-6">
                    <Label className="text-sm font-medium">Niche / Category</Label>
                    <div className="space-y-2">
                        {niches.map((niche) => (
                            <label key={niche} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filters.niche.includes(niche)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateFilter('niche', [...filters.niche, niche]);
                                        } else {
                                            updateFilter('niche', filters.niche.filter((n) => n !== niche));
                                        }
                                    }}
                                />
                                <span>{niche}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Followers</Label>
                        <span className="text-xs text-muted-foreground">
                            {formatFollowers(followerPreset.min)} – {formatFollowers(followerPreset.max)}
                        </span>
                    </div>

                    <Select
                        value={filters.followerRange ?? 'any'}
                        onValueChange={(value) =>
                            updateFilter(
                                'followerRange',
                                value === 'any' ? null : (value as FilterState['followerRange'])
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Any size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="nano">Nano (0–10K)</SelectItem>
                            <SelectItem value="micro">Micro (10K–100K)</SelectItem>
                            <SelectItem value="mid">Mid (100K–500K)</SelectItem>
                            <SelectItem value="macro">Macro (500K–1M)</SelectItem>
                            <SelectItem value="mega">Mega (1M+)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Engagement Rate */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Engagement Rate</Label>
                        <span className="text-xs text-muted-foreground">
                            {filters.engagementRate
                                ? `${ENGAGEMENT_PRESETS[filters.engagementRate].min}%+`
                                : 'Any'}
                        </span>
                    </div>

                    <Select
                        value={filters.engagementRate || 'any'}
                        onValueChange={(value) => updateFilter('engagementRate', value as any)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select engagement" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(ENGAGEMENT_PRESETS).map((key) => (
                                <SelectItem key={key} value={key}>
                                    {ENGAGEMENT_PRESETS[key].label} ({ENGAGEMENT_PRESETS[key].min}%+)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Platforms */}
                <div className="space-y-3 mb-6">
                    <Label className="text-sm font-medium">Platforms</Label>

                    <div className="flex flex-wrap gap-2">
                        {['Instagram', 'TikTok', 'YouTube', 'Twitch'].map((platform) => {
                            const selected = filters.platforms.includes(platform);

                            return (
                                <Button
                                    key={platform}
                                    type="button"
                                    variant={selected ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() =>
                                        updateFilter(
                                            'platforms',
                                            selected
                                                ? filters.platforms.filter(p => p !== platform)
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
                    <Label className="text-sm font-medium">Content Type</Label>

                    <div className="flex flex-wrap gap-2">
                        {['Reels', 'Stories', 'Posts', 'Lives'].map((type) => {
                            const selected = filters.contentTypes.includes(type);

                            return (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={selected ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() =>
                                        updateFilter(
                                            'contentTypes',
                                            selected
                                                ? filters.contentTypes.filter(t => t !== type)
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
                        {['Sponsored', 'Affiliate', 'UGC', 'Brand Ambassador'].map((type) => {
                            const selected = filters.collabTypes.includes(type);

                            return (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={selected ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() =>
                                        updateFilter(
                                            'collabTypes',
                                            selected
                                                ? filters.collabTypes.filter(t => t !== type)
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
                        value={filters.budgetRange ?? 'any'}
                        onValueChange={(value) =>
                            updateFilter('budgetRange', value === 'any' ? null : value)
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

                    <div
                        onClick={() => setCountryModalOpen(true)}
                        className="cursor-pointer border-2 border-input rounded-md px-3 py-2 bg-background hover:bg-accent transition text-sm flex items-center justify-between"
                    >
                        {filters.country ? (
                            <span className="text-foreground">
                                {filters.country}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">
                                Select country
                            </span>
                        )}
                    </div>

                    {filters.country && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-fit px-0 text-xs text-muted-foreground"
                            onClick={() => updateFilter("country", filters.country)}
                        >
                            Clear country
                        </Button>
                    )}
                </div>


                {/* Toggles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">VIP Only</span>
                            <span className="text-xs px-2 py-0.5 rounded-full badge-vip">Premium</span>
                        </div>
                        <Switch
                            checked={filters.isVIP}
                            onCheckedChange={(checked) => updateFilter('isVIP', checked)}
                        />
                    </div>
                </div>
            </aside>
            <CountryPickerModal
                open={countryModalOpen}
                onClose={() => setCountryModalOpen(false)}
                selected={filters.country ? [filters.country] : []}
                setSelected={(country) =>
                    updateFilter("country", country.name)
                }
                onSave={() => setCountryModalOpen(false)}
                shouldHaveOverlay={false}
            />
        </>
    );
};
