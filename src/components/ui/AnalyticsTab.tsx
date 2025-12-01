import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Eye, Heart, Users } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AnalyticsData } from "@/types/profile";

interface AnalyticsTabProps {
  analytics: AnalyticsData | null;
  isVIP: boolean;
  isLoading: boolean;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export const AnalyticsTab = ({ analytics, isVIP, isLoading }: AnalyticsTabProps) => {
  if (!isVIP) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-3xl border border-dashed" role="alert">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center mb-4">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Analytics</h3>
        <p className="text-center max-w-md mb-6">
          Unlock detailed insights about your audience engagement, reach trends, and performance metrics.
        </p>
        <Button className="bg-gradient-to-br from-primary to-secondary text-md py-6 rounded-full px-5 hover:scale-105 transition duration-300 ease-in-out">
          Request VIP Access
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="status" aria-label="Loading analytics" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 text-muted-foreground" role="alert">
        <p>No analytics data available</p>
      </div>
    );
  }

  const totalLikes = Number(analytics.totalLikes || 0);
  const totalViews = Number(analytics.totalViews || 0);

  let avgEngagement = 0;
  if (totalViews > 0) {
    avgEngagement = (totalLikes / totalViews) * 100;
  }

  const newFollowers = Number((analytics as any).newFollowersCount || 0);

  const viewsChange = 0;
  const likesChange = 0;
  const engagementChange = 0.0;
  const newFollowersChange = 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{viewsChange}% this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold text-foreground">{totalLikes.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{likesChange}% this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                <p className="text-2xl font-bold text-foreground">{avgEngagement.toFixed(1)}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{engagementChange}% this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Followers</p>
                <p className="text-2xl font-bold text-foreground">{newFollowers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{newFollowersChange}% this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate Trend</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {analytics.engagementOverTime.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-muted-foreground">
                Data not available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.engagementOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} name="Engagement %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Views by Platform */}
        <Card>
          <CardHeader>
            <CardTitle>Views by Platform</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {analytics.viewsByPlatform.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-muted-foreground">
                Data not available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.viewsByPlatform}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="views"
                  >
                    {analytics.viewsByPlatform.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>


        {/* Reach Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Reach</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {analytics.reachTrend.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-muted-foreground">
                Data not available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.reachTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey="reach" fill="hsl(var(--secondary))" name="Reach" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPerformingPosts.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-muted-foreground">
                Data not available yet
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topPerformingPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground">{post.engagement.toLocaleString()} engagements</p>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
