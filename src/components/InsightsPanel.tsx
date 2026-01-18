"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnalysisInsight } from "@/types/youtube";
import {
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Type,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  BarChart3,
  Sparkles,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowRight,
} from "lucide-react";

interface InsightsPanelProps {
  insights: AnalysisInsight[];
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  title: Type,
  thumbnail: ImageIcon,
  engagement: TrendingUp,
  frequency: Clock,
  growth: BarChart3,
  seo: Search,
  content: FileText,
};

const categoryLabels: Record<string, string> = {
  title: "タイトル",
  thumbnail: "サムネイル",
  engagement: "エンゲージメント",
  frequency: "投稿頻度",
  growth: "成長",
  seo: "SEO",
  content: "コンテンツ",
};

const statusConfig = {
  good: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-teal-500/20",
    badge: "success" as const,
    label: "良好",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradientFrom: "from-amber-500/20",
    gradientTo: "to-yellow-500/20",
    badge: "warning" as const,
    label: "注意",
  },
  critical: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradientFrom: "from-red-500/20",
    gradientTo: "to-rose-500/20",
    badge: "danger" as const,
    label: "要改善",
  },
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "good" | "warning" | "critical">("all");

  const goodCount = insights.filter((i) => i.status === "good").length;
  const warningCount = insights.filter((i) => i.status === "warning").length;
  const criticalCount = insights.filter((i) => i.status === "critical").length;

  const filteredInsights = filter === "all" 
    ? insights 
    : insights.filter((i) => i.status === filter);

  // ステータスごとにソート（critical > warning > good）
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    const order = { critical: 0, warning: 1, good: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 shadow-lg shadow-violet-500/10">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">分析インサイト</CardTitle>
              <CardDescription>チャンネル改善のための詳細分析</CardDescription>
            </div>
          </div>
          
          {/* フィルターボタン */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              すべて ({insights.length})
            </Button>
            <Button
              variant={filter === "good" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("good")}
              className={cn("text-xs", filter !== "good" && "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10")}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              良好 ({goodCount})
            </Button>
            <Button
              variant={filter === "warning" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("warning")}
              className={cn("text-xs", filter !== "warning" && "text-amber-400 border-amber-500/30 hover:bg-amber-500/10")}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              注意 ({warningCount})
            </Button>
            <Button
              variant={filter === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("critical")}
              className={cn("text-xs", filter !== "critical" && "text-red-400 border-red-500/30 hover:bg-red-500/10")}
            >
              <XCircle className="h-3 w-3 mr-1" />
              要改善 ({criticalCount})
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {sortedInsights.map((insight) => {
          const status = statusConfig[insight.status];
          const StatusIcon = status.icon;
          const CategoryIcon = categoryIcons[insight.category] || Lightbulb;
          const isExpanded = expandedId === insight.id;

          return (
            <div
              key={insight.id}
              className={cn(
                "group relative rounded-xl border overflow-hidden transition-all duration-300",
                status.borderColor,
                isExpanded ? "shadow-lg" : "hover:shadow-md"
              )}
            >
              {/* グラデーション背景 */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r opacity-50",
                status.gradientFrom,
                status.gradientTo
              )} />
              
              {/* メインコンテンツ */}
              <div className="relative">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                  className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500/50"
                >
                  <div className="flex items-start gap-4">
                    {/* アイコン */}
                    <div className={cn(
                      "p-2.5 rounded-xl transition-transform duration-300",
                      status.bgColor,
                      isExpanded && "scale-110"
                    )}>
                      <CategoryIcon className={cn("h-5 w-5", status.color)} />
                    </div>
                    
                    {/* テキスト */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          {insight.title}
                          <StatusIcon className={cn("h-4 w-4", status.color)} />
                        </h4>
                      </div>
                      <p className={cn(
                        "text-sm text-slate-300 transition-all duration-300",
                        !isExpanded && "line-clamp-1"
                      )}>
                        {insight.description}
                      </p>
                      
                      {/* メトリクスバー */}
                      {insight.metric && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                insight.status === "good" ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                insight.status === "warning" ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                                "bg-gradient-to-r from-red-500 to-rose-400"
                              )}
                              style={{ 
                                width: `${Math.min(100, (insight.metric.current / insight.metric.benchmark) * 100)}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {insight.metric.current.toFixed(1)} / {insight.metric.benchmark}{insight.metric.unit}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* バッジとアコーディオン */}
                    <div className="flex items-center gap-2">
                      <Badge variant={status.badge} className="hidden sm:inline-flex">
                        {categoryLabels[insight.category] || insight.category}
                      </Badge>
                      <div className={cn(
                        "p-1 rounded-full transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )}>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* 展開時の詳細 */}
                {isExpanded && insight.recommendation && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/60 border border-slate-700/50">
                      <div className="p-1.5 rounded-lg bg-amber-500/20">
                        <Lightbulb className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-300 mb-1">改善アドバイス</p>
                        <p className="text-sm text-slate-300">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredInsights.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>該当するインサイトがありません</p>
          </div>
        )}

        {/* AI分析予定のチェックリスト */}
        <div className="mt-6 p-5 rounded-xl border border-dashed border-slate-700 bg-slate-800/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">AI高度分析（Coming Soon）</h4>
              <p className="text-xs text-slate-500">OpenAI連携による詳細分析</p>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              { label: "動画サムネイルのAI画像分析", desc: "テキスト視認性・構図・色彩" },
              { label: "タイトルのSEOスコア算出", desc: "キーワード最適化・クリック誘発度" },
              { label: "説明文の改善提案", desc: "SEO・CTA・構造化" },
              { label: "競合チャンネル自動ベンチマーク", desc: "同ジャンルとの比較分析" },
              { label: "次回動画のテーマ提案", desc: "トレンド・視聴者ニーズ分析" },
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <Badge variant="info" className="text-xs flex-shrink-0">
                  準備中
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
