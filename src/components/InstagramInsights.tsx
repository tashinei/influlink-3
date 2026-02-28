import { Card, CardContent } from "@/components/ui/card";
import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from 'recharts';
import { Heart, MessageCircle, Users, LayoutGrid, Instagram } from "lucide-react";
import { BsInstagram } from "react-icons/bs";

interface InstagramInsightsProps {
    data: {
        ig_username?: string;
        profile_picture_url?: string;
        followers_count: number;
        follows_count: number;
        media_count: number;
        avg_likes: number;
        avg_comments: number;
        engagement_rate: number;
    } | null;
}

export const InstagramInsights = ({ data }: InstagramInsightsProps) => {
    if (!data) return null;

    const formatFollowers = (rawCount: any) => {
        const count = Number(rawCount || 0);
        if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
        if (count >= 1000) return (count / 1000).toFixed(1) + "k";
        return count.toString();
    };

    const interactionData = [
        { subject: 'Mon', A: 120 }, { subject: 'Tue', A: 150 },
        { subject: 'Wed', A: 80 }, { subject: 'Thu', A: 170 },
        { subject: 'Fri', A: 130 }, { subject: 'Sat', A: 110 },
        { subject: 'Sun', A: 90 },
    ];

    const igGradient = "from-[#833ab4] via-[#fd1d1d] to-[#fcb045]";

    return (
        /* Reduced padding for mobile (p-4) vs Desktop (lg:p-10) */
        <div className="mt-8 p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br from-secondary via-tertiary to-primary border border-[#90d5f3]/30 shadow-[0_20px_50px_rgba(144,213,243,0.1)] animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* HEADER: Stacked on very small screens, row on others */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 px-2 gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${igGradient} shadow-lg shadow-red-500/20`}>
                        <BsInstagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">Instagram Performance</h2>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-[#fd1d1d] animate-pulse" />
                            <p className="text-[9px] sm:text-[10px] text-white uppercase font-bold tracking-[0.2em]">Live Feed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

                {/* PROFILE CARD */}
                <Card className="relative bg-white border-slate-100 text-slate-900 overflow-hidden shadow-sm group">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${igGradient}`} />

                    <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr ${igGradient} p-[2px] sm:p-[3px] mb-4 sm:mb-6 shadow-md`}>
                            <div className="w-full h-full rounded-full bg-white p-1">
                                {data.profile_picture_url ? (
                                    <img
                                        src={data.profile_picture_url}
                                        alt={data.ig_username}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center">
                                        <Users className="text-slate-300 w-6 h-6 sm:w-8 sm:h-8" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-0.5 tracking-tight">
                            {data.ig_username || "Creator"}
                        </h3>
                        <p className="text-[#e1306c] font-bold text-xs sm:text-sm mb-6 sm:mb-8 tracking-tight">@{data.ig_username || "connected"}</p>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full border-t border-slate-50 pt-6 sm:pt-8">
                            <MetricBox label="Posts" value={data.media_count} />
                            <MetricBox label="Followers" value={formatFollowers(data.followers_count)} />
                            <MetricBox label="Following" value={data.follows_count} />
                        </div>
                    </CardContent>
                </Card>

                {/* RADAR CHART: Responsive height adjustments */}
                <Card className="lg:col-span-2 bg-white border-slate-100 text-slate-900 shadow-sm relative overflow-hidden">
                    <div className="p-4 sm:p-6 flex justify-between items-center border-b border-slate-50">
                        <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                            Engagement Distribution
                        </h4>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#833ab4]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#fd1d1d]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#fcb045]" />
                        </div>
                    </div>
                    {/* Fixed height of 300px on mobile, 340px on desktop */}
                    <CardContent className="h-[280px] sm:h-[340px] pt-4 sm:pt-6 px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={interactionData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} />
                                <Radar
                                    name="Interactions"
                                    dataKey="A"
                                    stroke="#fd1d1d"
                                    strokeWidth={2}
                                    fill="url(#igRadarGradient)"
                                    fillOpacity={0.4}
                                />
                                <defs>
                                    <linearGradient id="igRadarGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#833ab4" />
                                        <stop offset="50%" stopColor="#fd1d1d" />
                                        <stop offset="100%" stopColor="#fcb045" />
                                    </linearGradient>
                                </defs>
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* BOTTOM STAT CARDS: Ensure 2-column grid on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <StatCard
                    label="Engagement"
                    value={`${Number(data.engagement_rate || 0).toFixed(1)}%`}
                    icon={LayoutGrid}
                    bg="bg-gradient-to-br from-primary to-secondary"
                />
                <StatCard
                    label="Avg. Likes"
                    value={Math.round(Number(data.avg_likes || 0)).toLocaleString()}
                    icon={Heart}
                    bg="bg-gradient-to-br from-primary to-secondary"
                />
                <StatCard
                    label="Avg. Comments"
                    value={Math.round(Number(data.avg_comments || 0)).toLocaleString()}
                    icon={MessageCircle}
                    bg="bg-gradient-to-br from-primary to-secondary"
                />
                <StatCard
                    label="Total Reach"
                    value={formatFollowers(data.followers_count)}
                    icon={Users}
                    bg="bg-gradient-to-br from-primary to-secondary"
                />
            </div>
        </div>
    );
};

const MetricBox = ({ label, value }: { label: string, value: any }) => (
    <div className="space-y-0.5 text-center">
        {/* Adjusted text size for small screens */}
        <p className="text-lg sm:text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
        <p className="text-[10px] sm:text-[12px] uppercase font-bold text-slate-400 tracking-tight">{label}</p>
    </div>
);

const StatCard = ({ label, value, icon: Icon, bg }: any) => (
    <Card className="bg-white border-slate-100 transition-all duration-300 group">
        <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 text-center sm:text-left">
            <div className="order-2 sm:order-1">
                <p className="text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400 mb-0.5 sm:mb-1">{label}</p>
                <h4 className="text-lg sm:text-2xl font-black tracking-tighter text-slate-800">{value}</h4>
            </div>
            <div className={`order-1 sm:order-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl ${bg} text-white transition-all duration-300 group-hover:scale-110 shadow-sm`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            </div>
        </CardContent>
    </Card>
);