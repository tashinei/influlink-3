import React from "react";
import { TrendingUp, Eye, Users, DollarSign, Activity } from "lucide-react";

// --- Line Chart Component (SVG based) ---
// Generates a responsive SVG line chart with an area fill.
const LineChart = ({ data, maxValue }) => {
    // Chart dimensions configuration
    const padding = 5;
    const chartWidth = 100 - 2 * padding;
    const chartHeight = 100 - 2 * padding;
    const dataLength = data.length;

    if (dataLength < 2) {
        return <div className="text-center text-sm text-gray-500 py-4">Недостатъчно данни за графика.</div>;
    }

    // 1. Calculate points for the polyline
    const points = data.map((d, i) => {
        // X: evenly spaced points across the width
        const x = padding + (i / (dataLength - 1)) * chartWidth;
        // Y: scaled based on max value, inverted (SVG Y=0 is top)
        // We ensure a minimum value (e.g., 10%) so the line doesn't disappear if data is zero/low
        const normalizedValue = Math.max(d, maxValue * 0.1)
        const y = padding + chartHeight - (normalizedValue / maxValue) * chartHeight;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');

    // 2. Path for the background area (starts at bottom-left, follows points, goes to bottom-right)
    const areaPoints = [
        `${padding},${chartHeight + padding}`, // Bottom-left start
        ...points.split(' ').map(p => p.trim()), // Data points
        `${chartWidth + padding},${chartHeight + padding}`, // Bottom-right end
    ].join(' ');


    return (
        // Wrapper for fixed height and responsiveness
        <div className="relative w-full" style={{ height: '10rem' }}>
            {/* SVG container: viewBox defines coordinate system, preserveAspectRatio ensures fill */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.6}} />
                        <stop offset="100%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.05}} />
                    </linearGradient>
                </defs>

                {/* Area Fill */}
                <polyline
                    fill="url(#chartGradient)"
                    points={areaPoints}
                    className="transition-all duration-1000"
                />

                {/* Line Itself */}
                <polyline
                    fill="none"
                    stroke="#3b82f6" // Tailwind blue-500
                    strokeWidth="0.8"
                    points={points}
                    className="transition-all duration-1000"
                />

                {/* Data Points (Small dots for visual anchors) */}
                {data.map((d, i) => {
                    const [x, y] = points.split(' ')[i].split(',').map(Number);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="1.2"
                            fill="#1e40af" // Tailwind blue-700
                        />
                    );
                })}
            </svg>
        </div>
    );
};

// --- Main Dashboard Component ---

interface AnalyticsDashboardProps {
    userType?: "creator" | "brand";
}

export function AnalyticsDashboard({ userType = "creator" }: AnalyticsDashboardProps) {
    const stats = userType === "creator"
        ? [
            { label: "Total Earnings", value: "$12,450", icon: DollarSign, trend: "+23%", color: "text-green-500" },
            { label: "Active Campaigns", value: "8", icon: Activity, trend: "+3", color: "text-blue-500" },
            { label: "Total Reach", value: "245K", icon: Eye, trend: "+15%", color: "text-purple-500" },
            { label: "Engagement", value: "4.8%", icon: TrendingUp, trend: "+0.5%", color: "text-pink-500" },
        ]
        : [
            { label: "Campaign Spend", value: "$8,200", icon: DollarSign, trend: "+12%", color: "text-blue-500" },
            { label: "Active Influencers", value: "24", icon: Users, trend: "+6", color: "text-purple-500" },
            { label: "Total Impressions", value: "1.2M", icon: Eye, trend: "+28%", color: "text-green-500" },
            { label: "Avg. Engagement", value: "5.2%", icon: TrendingUp, trend: "+1.1%", color: "text-pink-500" },
        ];

    // Example performance data (normalized to 0-100 range)
    const chartData = userType === "creator"
        ? [30, 55, 42, 80, 72, 95, 60]
        : [45, 65, 50, 70, 85, 90, 75];

    // Use a fixed max value (e.g., 100) or calculate true max for scaling
    const maxValue = 100; 

    return (
        <div className="w-full h-full bg-gray-50 p-4 rounded-xl shadow-lg overflow-y-auto">

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">
                    Analytics Dashboard
                </h3>
                <p className="text-sm text-gray-500 mt-1">Last 7 periods of performance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            {/* The color classes are adjusted to Tailwind defaults */}
                            <stat.icon className={`w-5 h-5 ${stat.color} p-0.5 rounded-full bg-current/10`} />
                            <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.trend}</span>
                        </div>
                        <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Chart Visualization */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-base font-semibold text-gray-800 mb-4">
                    {userType === "creator" ? "Earnings Trend" : "Campaign Performance"}
                </p>

                {/* Line Chart Component */}
                <LineChart data={chartData} maxValue={maxValue} />
                
                {/* Days */}
                <div className="flex justify-between mt-4">
                    {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"].map((day, idx) => (
                        <span key={idx} className="text-xs text-gray-400 font-medium text-center">
                            {day}
                        </span>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mt-6">
                <p className="text-base font-semibold text-gray-800 mb-3">Recent Activity</p>

                <div className="space-y-3">
                    {[
                        { label: userType === "creator" ? "New campaign offer" : "Campaign launched", time: "2h ago", color: "bg-blue-500" },
                        { label: userType === "creator" ? "Payment received" : "Influencer onboarded", time: "5h ago", color: "bg-green-500" },
                        { label: "Milestone reached", time: "1d ago", color: "bg-pink-500" },
                    ].map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${activity.color} flex-shrink-0`} />
                            <div className="flex-1 min-w-0 flex justify-between items-center">
                                <p className="text-sm text-gray-700 truncate">{activity.label}</p>
                                <p className="text-xs text-gray-400 flex-shrink-0">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

// Global style for the "text-gradient" classes used in the original header
// I've simplified the header in this version, but including the style for completeness.
export function App() {
    return (
        <div className="p-4 min-h-screen bg-gray-100 flex items-start justify-center">
            {/* Example usage: Creator view */}
            <div className="w-full max-w-sm">
                <AnalyticsDashboard userType="creator" />
            </div>
            
            <style>{`
                .text-gradient {
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .bg-background { background-color: #f9fafb; /* Light Gray */ }
                .bg-muted\\/50 { background-color: rgba(243, 244, 246, 0.5); /* Very light gray */ }
                .border-border { border-color: #e5e7eb; /* Gray 200 */ }
                .text-foreground { color: #1f2937; /* Gray 800 */ }
                .text-muted-foreground { color: #6b7280; /* Gray 500 */ }
                .text-primary { color: #3b82f6; /* Blue 500 */ }
                .text-secondary { color: #ec4899; /* Pink 500 */ }
                .text-accent { color: #a855f7; /* Purple 500 */ }
                .text-success { color: #10b981; /* Green 500 */ }
            `}</style>
        </div>
    );
}