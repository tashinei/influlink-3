import { useState, useMemo } from "react";
import { FilterState } from '@/types/creator';
import { useCreatorNiches } from '@/data/mockCreators';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FOLLOWER_PRESETS, ENGAGEMENT_PRESETS } from '@/types/followers';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Filter, RotateCcw, MapPin, EyeIcon, EyeOff } from 'lucide-react';
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
    const [collapsed, setCollapsed] = useState(false);
    const [countryModalOpen, setCountryModalOpen] = useState(false);
    const niches = useCreatorNiches();

    const hasActiveFilters = useMemo(() => (
        filters.niche.length > 0 ||
        filters.followerRange ||
        filters.isVIP ||
        filters.country ||
        filters.engagementRate !== 'any'
    ), [filters]);

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    // Keep hooks above this line
    if (!isOpen) return null;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden animate-in fade-in duration-300"
                onClick={onClose}
            />

            <aside
                className={`
                    /* Positioning & Size */
                    fixed lg:sticky top-0 right-0 h-full lg:h-[calc(100vh-4rem)] lg:top-8 z-[51]
                    w-[85%] sm:w-80 lg:w-72
                    
                    /* Style & Background */
                    bg-white dark:bg-zinc-950 lg:bg-transparent
                    border-l dark:border-zinc-800 lg:border-none
                    lg:glass-card rounded-none lg:rounded-2xl p-6
                    
                    /* THE KEY FIX: Flex container */
                    flex flex-col
                    
                    /* Animation */
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
                    shadow-2xl lg:shadow-none
                `}
            >
                {/* Header - Stays Pinned */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b lg:border-none shrink-0">
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
                        >
                            {collapsed ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden h-8 w-8">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Actual Filters - This is the ONLY scrollable area */}
                <div className={`
                    /* SCROLL LOGIC */
                    flex-1 overflow-y-auto pr-2 -mr-2
                    
                    /* Content Spacing */
                    space-y-6 transition-all duration-500 ease-in-out
                    ${collapsed ? 'opacity-0 pointer-events-none max-h-0' : 'opacity-100 max-h-full'}
                    
                    /* Optional: custom scrollbar */
                    scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800
                `}>

                    {/* Niches */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Niches</Label>
                        <div className="flex flex-wrap gap-2">
                            {niches.map((niche) => {
                                const isSelected = filters.niche.includes(niche);
                                return (
                                    <Button
                                        key={niche}
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        className={`rounded-full px-4 h-8 text-xs ${isSelected ? 'shadow-md shadow-primary/20' : ''}`}
                                        onClick={() =>
                                            updateFilter(
                                                "niche",
                                                isSelected
                                                    ? filters.niche.filter((n) => n !== niche)
                                                    : [...filters.niche, niche]
                                            )
                                        }
                                    >
                                        {niche}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Followers Select */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Follower Count</Label>
                        <Select
                            value={filters.followerRange ?? 'any'}
                            onValueChange={(val) => updateFilter('followerRange', val === 'any' ? null : (val as any))}
                        >
                            <SelectTrigger className="w-full bg-background/50">
                                <SelectValue placeholder="Any size" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                <SelectItem value="any">Any size</SelectItem>
                                <SelectItem value="nano">Nano (0–10K)</SelectItem>
                                <SelectItem value="micro">Micro (10K–100K)</SelectItem>
                                <SelectItem value="mid">Mid (100K–500K)</SelectItem>
                                <SelectItem value="macro">Macro (500K–1M)</SelectItem>
                                <SelectItem value="mega">Mega (1M+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Picker */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Location</Label>
                        <div
                            onClick={() => setCountryModalOpen(true)}
                            className="flex items-center justify-between cursor-pointer border dark:border-zinc-800 rounded-lg px-4 py-2 bg-background/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                <span className={`text-sm truncate ${filters.country ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                    {filters.country || "Select country"}
                                </span>
                            </div>
                            {filters.country && (
                                <X className="w-4 h-4 hover:text-destructive" onClick={(e) => { e.stopPropagation(); updateFilter("country", ""); }} />
                            )}
                        </div>
                    </div>

                    {/* VIP Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="space-y-0.5">
                            <span className="text-sm font-bold">VIP Creators</span>
                            <p className="text-[10px] text-muted-foreground">Premium verified only</p>
                        </div>
                        <Switch
                            checked={filters.isVIP}
                            onCheckedChange={(checked) => updateFilter('isVIP', checked)}
                        />
                    </div>

                    {/* Mobile Apply Button - Move inside scroll area for accessibility */}
                    <div className="lg:hidden pt-4 pb-10">
                        <Button className="w-full shadow-lg" onClick={onClose}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </aside>

            {/* CountryPicker remains outside */}
            <CountryPickerModal
                open={countryModalOpen}
                onClose={() => setCountryModalOpen(false)}
                selected={filters.country ? [filters.country] : []}
                setSelected={(countryData) => {
                    const country = Array.isArray(countryData) ? countryData[0] : countryData;
                    if (country?.name) updateFilter("country", country.name);
                }}
                onSave={() => setCountryModalOpen(false)}
                shouldHaveOverlay={false}
            />
        </>
    );
};