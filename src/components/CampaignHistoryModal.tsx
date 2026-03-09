import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Table,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    TrendingUp,
    FileText,
    Search,
    ArrowLeft,
    Calendar,
    Eye,
    Download,
    AlertCircle,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadCampaignReportPDF } from "@/lib/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const BRAND = {
    light: "#90d5f3",
    medium: "#6EC5E9",
    primary: "#1E88E5",
    white: "#FFFFFF"
};

interface Campaign {
    id: number;
    name: string;
    brand: string;
    date: string;
    status: string;
    earnings: number;
    reach: string;
    engagement: string;
    description?: string;
    deliverables?: string[];
}

interface CampaignHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CampaignHistoryModal({ open, onOpenChange }: CampaignHistoryModalProps) {
    const [viewMode, setViewMode] = useState<"list" | "details" | "report">("list");
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [isExporting, setIsExporting] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useUserStore();
    const {t} = useTranslation();
    useEffect(() => {
        if (!open) return;
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/campaigns/history`,
                    {
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            // ЗАДЪЛЖИТЕЛНО И ТУК:
                            ...(token && { "Authorization": `Bearer ${token}` })
                        }
                    });
                if (!res.ok) throw new Error("Could not fetch data.");
                const data = await res.json();
                console.log("Raw Campaigns Data from API:", data);
                setCampaigns(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, [open, token]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((c) => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.brand.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === "All" || c.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [campaigns, searchQuery, filterStatus]);

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => { setViewMode("list"); setSelectedCampaign(null); }, 300);
    };

    const handleDownload = async () => {
        if (!selectedCampaign) return;
        setIsExporting(true);
        try {
            await downloadCampaignReportPDF(selectedCampaign);
            toast({ title: "Success", description: "Report downloaded." });
        } catch (err) {
            toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            "completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
            "inProgress": "bg-blue-50 text-blue-600 border-blue-100",
            "pending": "bg-amber-50 text-amber-600 border-amber-100",
        };
        return <Badge className={cn("px-3 py-1 rounded-full border", styles[status] || "bg-zinc-50")}>{t(`mvpCampaignHistory.${status}`)}</Badge>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        // Returns format: "Oct 24, 2023"
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const renderListView = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-zinc-900">{t("mvpCampaignHistory.title")}</h2>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input placeholder={t("mvpCampaignHistory.searchCampaigns")} className="pl-10 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex bg-zinc-100 p-1 rounded-xl shrink-0">
                        {["All", "In Progress", "Completed"].map((s) => (
                            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", filterStatus === s ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800")}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {loading ? (
                    <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
                ) : (
                    <Table>
                        <TableHeader><TableRow><TableHead>{t("mvpCampaignHistory.campaign")}</TableHead><TableHead>{t("mvpCampaignHistory.status")}</TableHead><TableHead className="text-right">{t("mvpCampaignHistory.data")}</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredCampaigns.map((c) => (
                                <TableRow key={c.id} className="hover:bg-zinc-50/50">
                                    <TableCell className="font-bold">{c.name}<br /><span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{c.brand}</span></TableCell>
                                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedCampaign(c); setViewMode("details"); }} className="rounded-full hover:bg-white hover:shadow-sm">
                                            <FileText className="h-4 w-4 text-zinc-400 hover:text-blue-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
            <div className="p-4 border-t shrink-0 bg-zinc-50/50 flex justify-end">
                <Button variant="outline" onClick={handleClose} className="rounded-full px-8 font-bold">Close</Button>
            </div>
        </div>
    );

    // --- VIEW: DETAILS ---
    const renderDetailsView = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b shrink-0 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setViewMode("list")} className="font-bold text-zinc-500"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                {getStatusBadge(selectedCampaign!.status)}
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                <div>
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tight">{selectedCampaign!.name}</h2>
                    <p className="text-lg text-zinc-500 mt-1 font-medium">{t("mvpCampaignHistory.brand")}: {selectedCampaign!.brand}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-3xl border-2 border-zinc-50 bg-zinc-50/50 text-center">
                        <p className="text-xs font-black text-zinc-400 uppercase mb-1">{t("mvpCampaignHistory.reach")}</p>
                        <p className="text-3xl font-black text-zinc-900">{selectedCampaign!.reach}</p>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-zinc-50 bg-zinc-50/50 text-center">
                        <p className="text-xs font-black text-zinc-400 uppercase mb-1">{t("mvpCampaignHistory.engagement")}</p>
                        <p className="text-3xl font-black text-zinc-900">{selectedCampaign!.engagement}</p>
                    </div>
                    <div className="p-6 rounded-3xl border-2 text-center" style={{ borderColor: BRAND.light, backgroundColor: `${BRAND.light}11` }}>
                        <p className="text-xs font-black uppercase mb-1" style={{ color: BRAND.primary }}>{t("mvpCampaignHistory.earnings")}</p>
                        <p className="text-3xl font-black" style={{ color: BRAND.primary }}>${selectedCampaign!.earnings.toLocaleString()}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="font-bold text-zinc-900 uppercase text-xs tracking-widest">{t("mvpCampaignHistory.desc")}</h4>
                    <p className="text-zinc-600 leading-relaxed">{selectedCampaign!.description || "Collaboration summary details not provided."}</p>
                </div>
            </div>
            <div className="p-6 border-t shrink-0 flex justify-between gap-4">
                <Button variant="outline" onClick={() => setViewMode("list")} className="rounded-full px-8 font-bold">{t("mvpCampaignHistory.back")}</Button>
                <Button onClick={() => setViewMode("report")} className="rounded-full px-8 text-white font-bold" style={{ backgroundColor: BRAND.primary }}>{t("mvpCampaignHistory.viewAnalytics")}</Button>
            </div>
        </div>
    );

    // --- VIEW: REPORT (PDF-PREVIEW STYLE) ---
    const renderReportView = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b shrink-0 flex justify-between items-center">
                <Button variant="ghost" onClick={() => setViewMode("details")} className="font-bold text-zinc-500"><ArrowLeft className="mr-2 h-4 w-4" /> Exit</Button>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">{t("mvpCampaignHistory.certifiedMetrics")}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-12">
                <div className="text-center">
                    <h3 className="text-4xl font-black text-zinc-900 mb-2">{selectedCampaign!.name}</h3>
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">{t("mvpCampaignHistory.performanceSince")} - {formatDate(selectedCampaign!.date)}</p>
                </div>
                <div className="grid grid-cols-2 gap-12 max-w-2xl mx-auto">
                    <div className="text-center border-r">
                        <p className="text-xs font-black text-blue-500 uppercase mb-2">{t("mvpCampaignHistory.impressions")}</p>
                        <p className="text-6xl font-black tracking-tighter text-zinc-900">{selectedCampaign!.reach}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black text-zinc-400 uppercase mb-2">{t("mvpCampaignHistory.engagementRate")}</p>
                        <p className="text-6xl font-black tracking-tighter text-zinc-900">{selectedCampaign!.engagement}</p>
                    </div>
                </div>
                <div className="space-y-6 max-w-lg mx-auto p-8 rounded-[40px] bg-zinc-50 border border-zinc-100">
                    <p className="text-xs font-black text-zinc-400 uppercase text-center tracking-widest mb-4">{t("mvpCampaignHistory.trafficInsights")}</p>
                    {[{ l: "Interaction", v: "72%", c: BRAND.primary }, { l: "Shares", v: "18%", c: BRAND.medium }, { l: "Saved", v: "10%", c: BRAND.light }].map((item, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase"><span>{item.l}</span><span>{item.v}</span></div>
                            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: item.v, backgroundColor: item.c }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-8 border-t shrink-0 flex justify-between items-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Report Generated: {formatDate(new Date().toLocaleDateString())}</p>
                <Button
                    onClick={handleDownload}
                    disabled={isExporting}
                    className="rounded-full px-10 font-black text-white shadow-xl shadow-blue-500/20"
                    style={{ backgroundColor: BRAND.primary }}
                >
                    {isExporting ? <div className="h-4 w-4 animate-spin border-2 border-white/30 border-t-white rounded-full" /> : <><Download className="mr-2 h-4 w-4" /> {t("mvpCampaignHistory.downloadPDF")}</>}
                </Button>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* The h-[85vh] and overflow-hidden here are crucial to keep your buttons on screen */}
            <DialogContent className="max-w-4xl gap-0 h-[85vh] overflow-hidden bg-white sm:rounded-[32px] border-none shadow-2xl flex flex-col p-6 z-[50000]">
                {viewMode === "list" && renderListView()}
                {viewMode === "details" && renderDetailsView()}
                {viewMode === "report" && renderReportView()}
            </DialogContent>
        </Dialog>
    );
}