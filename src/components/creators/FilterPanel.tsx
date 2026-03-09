import { useEffect, useState, useMemo } from "react";
import { FilterState } from '@/types/creator';
import { useCreatorNiches } from '@/data/mockCreators';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Filter, RotateCcw, MapPin, EyeIcon, EyeOff, Globe, Layers, Handshake } from 'lucide-react';
import CountryPickerModal from '../CountryPickerModal';

// Shared constants from your Search Section
const platforms = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook"];
const languagesList = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Japanese", "Bulgarian", "Hindi", "Chinese"];
const engagementRates = [
    { label: "Any", value: "any" },
    { label: "Low (<2%)", value: "low" },
    { label: "Medium (2-5%)", value: "medium" },
    { label: "High (5%+)", value: "high" },
];
const contentTypes = ["Photos", "Reels/Shorts", "Stories", "Long-form Video", "Live Streams"];
const collaborationTypes = ["Sponsored Posts", "Product Reviews", "Affiliate", "Brand Ambassador", "UGC Content", "Giveaways"];

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
        filters.platforms?.length > 0 ||
        filters.contentTypes?.length > 0 ||
        filters.collabTypes?.length > 0 ||
        filters.languages?.length > 0 ||
        filters.followerRange ||
        filters.isVIP ||
        filters.country ||
        filters.engagementRate !== 'any'
    ), [filters]);

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const toggleArrayFilter = (key: keyof FilterState, value: string) => {
        const current = (filters[key] as string[]) || [];
        const updated = current.includes(value)
            ? current.filter(i => i !== value)
            : [...current, value];
        updateFilter(key, updated as any);
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300 z-[5000] lg:z-[51]`}
                onClick={onClose}
            />
            <aside className={`fixed lg:sticky top-0 right-0 h-full lg:h-[calc(100vh-4rem)] lg:top-8 z-[5000] lg:z-[51] w-[85%] sm:w-80 lg:w-72 bg-white dark:bg-zinc-950 lg:bg-transparent border-l dark:border-zinc-800 lg:border-none lg:glass-card rounded-none lg:rounded-2xl p-6 flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} shadow-2xl lg:shadow-none`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b lg:border-none shrink-0">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground tracking-tight">Filters</h2>
                    </div>
                    <div className="flex items-center gap-1">
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive">
                                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
                            {collapsed ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden h-8 w-8"><X className="w-5 h-5" /></Button>
                    </div>
                </div>

                {/* Scrollable Area */}
                <div className={`flex-1 overflow-y-auto pr-2 -mr-2 space-y-7 transition-all duration-500 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

                    {/* Niches */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Niches</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {niches.map((niche) => (
                                <Badge
                                    key={niche}
                                    variant={filters.niche.includes(niche) ? "default" : "outline"}
                                    className="cursor-pointer rounded-md px-2 py-0.5 text-[11px]"
                                    onClick={() => toggleArrayFilter("niche", niche)}
                                >
                                    {niche}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Platforms */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-primary">Platforms</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {platforms.map((p) => (
                                <Badge
                                    key={p}
                                    variant={filters.platforms?.includes(p) ? "default" : "outline"}
                                    className="cursor-pointer rounded-md px-2 py-0.5 text-[11px]"
                                    onClick={() => toggleArrayFilter("platforms", p)}
                                >
                                    {p}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Followers & Engagement (Two per row) */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase">Reach</Label>
                            <Select value={filters.followerRange ?? 'any'} onValueChange={(val) => updateFilter('followerRange', val === 'any' ? null : val)}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Any size" /></SelectTrigger>
                                <SelectContent className="z-[100]">
                                    <SelectItem value="any">Any size</SelectItem>
                                    <SelectItem value="nano">Nano (1K-10K)</SelectItem>
                                    <SelectItem value="micro">Micro (10K-100K)</SelectItem>
                                    <SelectItem value="mid">Mid (100K-500K)</SelectItem>
                                    <SelectItem value="macro">Macro (500K-1M)</SelectItem>
                                    <SelectItem value="mega">Mega (1M+)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase">Engagement</Label>
                            <Select value={filters.engagementRate} onValueChange={(val) => updateFilter('engagementRate', val)}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Any" /></SelectTrigger>
                                <SelectContent className="z-[100]">
                                    {engagementRates.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-zinc-400 uppercase">Location</Label>
                        <div onClick={() => setCountryModalOpen(true)} className="flex items-center justify-between border dark:border-zinc-800 rounded-lg px-3 py-2 bg-background/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="text-xs truncate">{filters.country || "Select country"}</span>
                            </div>
                            {filters.country && <X className="w-3 h-3 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); updateFilter("country", ""); }} />}
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3" /> Languages</Label>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1">
                            {languagesList.map((lang) => {
                                const val = lang.toLowerCase();
                                const isSel = filters.languages?.includes(val);
                                return (
                                    <button
                                        key={val}
                                        onClick={() => toggleArrayFilter("languages", val)}
                                        className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${isSel ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}
                                    >
                                        {lang}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content & Collab Types (Scrollable Badges) */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2"><Layers className="w-3 h-3" /> Content</Label>
                            <div className="flex flex-wrap gap-1">
                                {contentTypes.map(c => (
                                    <Badge
                                        key={c}
                                        variant={filters.contentTypes?.includes(c) ? "default" : "outline"}
                                        className="text-[9px] px-1.5 py-0 cursor-pointer"
                                        onClick={() => toggleArrayFilter("contentTypes", c)}
                                    >
                                        {c}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2"><Handshake className="w-3 h-3" /> Collaboration</Label>
                            <div className="flex flex-wrap gap-1">
                                {collaborationTypes.map(c => (
                                    <Badge
                                        key={c}
                                        variant={filters.collabTypes?.includes(c) ? "default" : "outline"}
                                        className="text-[9px] px-1.5 py-0 cursor-pointer"
                                        onClick={() => toggleArrayFilter("collabTypes", c)}
                                    >
                                        {c}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* VIP Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold">VIP Creator</span>
                            <p className="text-[9px] text-muted-foreground italic">Verified only</p>
                        </div>
                        <Switch checked={filters.isVIP} onCheckedChange={(checked) => updateFilter('isVIP', checked)} />
                    </div>

                    <div className="lg:hidden pt-4 pb-10">
                        <Button className="w-full h-11 shadow-lg" onClick={onClose}>Apply filters</Button>
                    </div>
                </div>
            </aside>

            <CountryPickerModal
                open={countryModalOpen}
                onClose={() => setCountryModalOpen(false)}
                selected={filters.country ? [{ name: filters.country, code: '' }] : []}
                setSelected={(data) => {
                    const country = Array.isArray(data) ? data[0] : data;
                    if (country?.name) updateFilter("country", country.name);
                }}
                onSave={() => setCountryModalOpen(false)}
                shouldHaveOverlay={false}
            />
        </>
    );
};