import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableCell, TableHead, TableHeader, TableRow, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, DollarSign, Briefcase, Search, ArrowLeft, Calendar, Eye } from "lucide-react";

const DARK_BLUE = "#1E88E5";
const MID_BLUE = "#6EC5E9";
const LIGHT_BLUE = "#90d5f3ff";

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
    platforms?: string[];
}

interface CampaignHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const mockCampaigns: Campaign[] = [
    {
        id: 1,
        name: "Summer Sneaker Launch",
        brand: "ShoeCo",
        date: "2024-07-15",
        status: "Completed",
        earnings: 1500,
        reach: "1.2M",
        engagement: "6.5%",
        description: "Promoted the new summer sneaker collection through lifestyle content and unboxing videos.",
        deliverables: ["3 Instagram Reels", "1 TikTok Video", "5 Story Posts"],
        platforms: ["Instagram", "TikTok"]
    },
    {
        id: 2,
        name: "Autumn Skincare Promo",
        brand: "GlowUp Inc.",
        date: "2024-09-01",
        status: "In Progress",
        earnings: 2500,
        reach: "450K",
        engagement: "4.1%",
        description: "Ongoing skincare routine showcase featuring the autumn collection products.",
        deliverables: ["2 YouTube Videos", "4 Instagram Posts", "Story Takeover"],
        platforms: ["YouTube", "Instagram"]
    },
    {
        id: 3,
        name: "Winter Collection",
        brand: "FashionX",
        date: "2024-11-20",
        status: "Pending Payment",
        earnings: 3200,
        reach: "890K",
        engagement: "5.2%",
        description: "Winter fashion lookbook featuring coats, boots, and accessories.",
        deliverables: ["1 YouTube Lookbook", "6 Instagram Posts", "2 Reels"],
        platforms: ["YouTube", "Instagram"]
    },
];

type ViewMode = "list" | "details" | "report";

const CampaignHistoryModal = ({ open, onOpenChange }: CampaignHistoryModalProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const handleViewDetails = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setViewMode("details");
    };

    const handleViewReport = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setViewMode("report");
    };

    const handleBack = () => {
        setViewMode("list");
        setSelectedCampaign(null);
    };

    const handleClose = () => {
        setViewMode("list");
        setSelectedCampaign(null);
        onOpenChange(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Completed":
                return <Badge style={{ backgroundColor: LIGHT_BLUE + '15', color: "white", borderColor: LIGHT_BLUE + '20' }} className="bg-gradient-to-br from-primary to-secondary">Completed</Badge>;
            case "In Progress":
                return <Badge style={{ backgroundColor: DARK_BLUE + '15', borderColor: DARK_BLUE + '20' }} className="bg-white text-primary w-max justify-center">In Progress</Badge>;
            case "Pending Payment":
                return <Badge className="bg-white text-primary hover:bg-white border-secondary">Pending</Badge>;
            case "Draft":
                return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const campaignsToDisplay = mockCampaigns;

    // DETAILS VIEW - SIMPLIFIED FOR MVP
    const renderDetailsView = () => {
        if (!selectedCampaign) return null;
        return (
            <>
                <DialogHeader className="px-8 pt-8 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <DialogTitle className="text-2xl font-semibold">{selectedCampaign.name}</DialogTitle>
                            <DialogDescription className="mt-1">Campaign details for {selectedCampaign.brand}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

                    <div className="flex items-center gap-4">
                        {getStatusBadge(selectedCampaign.status)}
                        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                            <Calendar className="w-4 h-4" /> {selectedCampaign.date}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</h4>
                        <p className="text-foreground">{selectedCampaign.description || "No description available."}</p>
                    </div>

                    {/* Simplified Key Metrics (Just the essentials) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm text-muted-foreground mb-1">Earnings</p>
                            <p className="text-2xl font-semibold" style={{ color: MID_BLUE }}>${selectedCampaign.earnings.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm text-muted-foreground mb-1">Reach</p>
                            <p className="text-2xl font-semibold">{selectedCampaign.reach}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm text-muted-foreground mb-1">Engagement</p>
                            <p className="text-2xl font-semibold">{selectedCampaign.engagement}</p>
                        </div>
                    </div>

                    {/* Platforms section remains simple */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Platforms</h4>
                        <div className="flex gap-2">
                            {selectedCampaign.platforms?.map((platform, i) => (
                                <Badge key={i} variant="secondary">{platform}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-8 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                    <Button variant="outline" onClick={handleBack}>Back to List</Button>
                    <Button onClick={() => handleViewReport(selectedCampaign)} className="gap-2" style={{ backgroundColor: DARK_BLUE, color: 'white', hover: { backgroundColor: MID_BLUE } }}>
                        <TrendingUp className="w-4 h-4" /> View Report
                    </Button>
                </div>
            </>
        );
    };

    // REPORT VIEW - SIMPLIFIED FOR MVP
    const renderReportView = () => {
        if (!selectedCampaign) return null;

        // Mock metrics data for basic display
        const metrics = {
            impressions: 1250000,
            earnings: selectedCampaign.earnings,
        };

        return (
            <>
                <DialogHeader className="px-8 pt-8 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" style={{ color: DARK_BLUE }} />
                                Campaign Summary
                            </DialogTitle>
                            <DialogDescription className="mt-1">{selectedCampaign.name} • {selectedCampaign.brand}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                    {/* Simplified Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                            <Eye className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-2xl font-semibold">{(metrics.impressions / 1000000).toFixed(1)}M</p>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                            <DollarSign className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-2xl font-semibold" style={{ color: DARK_BLUE }}>${metrics.earnings.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total Earnings</p>
                        </div>
                    </div>

                    {/* Performance Metrics Summary */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Performance Metrics</h4>
                        <div className="p-4 rounded-lg bg-muted/50 border border-border grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Campaign Reach</p>
                                <p className="text-xl font-semibold">{selectedCampaign.reach}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                                <p className="text-xl font-semibold">{selectedCampaign.engagement}</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="px-8 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                    <Button variant="outline" onClick={handleBack}>Back to List</Button>
                    <Button variant="outline" className="gap-2">
                        Download Report
                    </Button>
                </div>
            </>
        );
    };

    // List View
    const renderListView = () => (
        <>
            <DialogHeader className="px-8 pt-8 pb-6 border-b border-border">
                <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
                    Campaign History
                </DialogTitle>
                <DialogDescription className="mt-2 text-muted-foreground">
                    Review all past and ongoing collaborations with brands.
                </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
                {campaignsToDisplay.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="p-4 rounded-full bg-muted/50 mb-6">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-md">
                            Start applying to open opportunities or pitching to brands to build your collaboration history.
                        </p>
                        <Button size="lg" style={{ backgroundColor: DARK_BLUE, color: 'white', hover: { backgroundColor: MID_BLUE } }}>Find Opportunities</Button>
                    </div>
                ) : (
                    <div className="px-8 py-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border">
                                    <TableHead className="text-xs uppercase tracking-wider text-[#22222] font-medium">Campaign</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider text-[#22222] font-medium">Brand</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider text-[#22222] font-medium">Date</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider text-[#22222] font-medium">Status</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider text-[#22222] font-medium text-right">Earnings</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider text-[#22222] font-medium text-right">Performance</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider text-[#22222] font-medium text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaignsToDisplay.map((campaign) => (
                                    <TableRow key={campaign.id} className="group hover:bg-secondary/20">
                                        <TableCell className="font-medium py-4">{campaign.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{campaign.brand}</TableCell>
                                        <TableCell className="text-muted-foreground tabular-nums">{campaign.date}</TableCell>
                                        <TableCell className="width-[110%]">{getStatusBadge(campaign.status)}</TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums">
                                            <span style={{ color: MID_BLUE }}>${campaign.earnings.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="text-sm space-y-0.5">
                                                <p className="text-foreground font-medium">{campaign.reach}</p>
                                                <p className="text-muted-foreground text-xs">{campaign.engagement} eng.</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {campaign.status !== "Draft" && (
                                                    <Button variant="outline" size="sm" className="h-8 gap-1.5 hover:bg-gray-200" onClick={() => handleViewReport(campaign)}>
                                                        <TrendingUp className="w-3.5 h-3.5" /> Report
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 hover:text-primary" onClick={() => handleViewDetails(campaign)}>
                                                    <FileText className="w-3.5 h-3.5" /> Details
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {campaignsToDisplay.length > 0 && (
                <div className="px-8 py-4 border-t border-border bg-muted/30 flex items-center justify-between rounded-full">
                    <p className="text-sm text-muted-foreground">Showing {campaignsToDisplay.length} campaigns</p>
                    <Button variant="outline" size="lg" className="bg-gradient-to-br from-primary to-secondary text-[white] text-md" onClick={handleClose}>Close</Button>
                </div>
            )}
        </>
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl p-0 gap-0 flex flex-col max-h-[85vh] pb-[2%] pr-0">
                {viewMode === "list" && renderListView()}
                {viewMode === "details" && renderDetailsView()}
                {viewMode === "report" && renderReportView()}
            </DialogContent>
        </Dialog>
    );
};

export default CampaignHistoryModal;