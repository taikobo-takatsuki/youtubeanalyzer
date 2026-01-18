"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoInfo, PerformanceMetrics } from "@/types/youtube";
import { formatNumber, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Activity,
  Eye,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceChartsProps {
  videos: VideoInfo[];
  metrics: PerformanceMetrics;
}

export function PerformanceCharts({ videos, metrics }: PerformanceChartsProps) {
  // 動画データをグラフ用に整形（古い順に並べ替え）
  const chartData = useMemo(() => {
    return [...videos]
      .reverse()
      .map((video, index) => ({
        name: `#${index + 1}`,
        title: video.title.length > 20 ? video.title.substring(0, 20) + "..." : video.title,
        fullTitle: video.title,
        date: formatDate(video.publishedAt),
        views: video.viewCount,
        likes: video.likeCount,
        comments: video.commentCount,
        engagement: parseFloat(video.engagementRate),
      }));
  }, [videos]);

  // エンゲージメントトレンドアイコン
  const TrendIcon = metrics.engagementTrend === "up" 
    ? TrendingUp 
    : metrics.engagementTrend === "down" 
      ? TrendingDown 
      : Minus;

  const trendColor = metrics.engagementTrend === "up" 
    ? "text-emerald-400" 
    : metrics.engagementTrend === "down" 
      ? "text-red-400" 
      : "text-slate-400";

  // カスタムTooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = chartData.find((d) => d.name === label);
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{data?.fullTitle}</p>
          <p className="text-xs text-slate-400 mb-2">{data?.date}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <span style={{ color: entry.color }}>{entry.name}</span>
                <span className="font-medium text-white">
                  {entry.name === "エンゲージメント" 
                    ? `${entry.value.toFixed(2)}%` 
                    : formatNumber(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* パフォーマンスサマリー */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20">
                <Activity className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg">パフォーマンス推移</CardTitle>
                <CardDescription>直近{videos.length}本の動画分析</CardDescription>
              </div>
            </div>
            <Badge 
              variant={metrics.engagementTrend === "up" ? "success" : metrics.engagementTrend === "down" ? "danger" : "outline"}
              className="flex items-center gap-1"
            >
              <TrendIcon className={cn("h-3 w-3", trendColor)} />
              {metrics.engagementTrend === "up" ? "上昇傾向" : metrics.engagementTrend === "down" ? "下降傾向" : "安定"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* クイックスタッツ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-sky-400" />
                <span className="text-xs text-slate-400">平均再生数</span>
              </div>
              <p className="text-xl font-bold text-white">{formatNumber(metrics.averageViews)}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-rose-400" />
                <span className="text-xs text-slate-400">平均いいね</span>
              </div>
              <p className="text-xl font-bold text-white">{formatNumber(metrics.averageLikes)}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-slate-400">平均コメント</span>
              </div>
              <p className="text-xl font-bold text-white">{formatNumber(metrics.averageComments)}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendIcon className={cn("h-4 w-4", trendColor)} />
                <span className="text-xs text-slate-400">成長率</span>
              </div>
              <p className={cn("text-xl font-bold", 
                metrics.viewsGrowthRate > 0 ? "text-emerald-400" : 
                metrics.viewsGrowthRate < 0 ? "text-red-400" : "text-white"
              )}>
                {metrics.viewsGrowthRate > 0 ? "+" : ""}{metrics.viewsGrowthRate}%
              </p>
            </div>
          </div>

          {/* 再生数グラフ */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  name="再生数"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="engagement"
                  name="エンゲージメント"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ fill: "#f43f5e", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#f43f5e" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* いいね・コメント比較 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20">
              <BarChart3 className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <CardTitle className="text-lg">エンゲージメント詳細</CardTitle>
              <CardDescription>いいね・コメントの動画別比較</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                />
                <Bar dataKey="likes" name="いいね" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" name="コメント" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
