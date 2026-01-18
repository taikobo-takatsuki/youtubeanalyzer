"use client";

import { useState } from "react";
import { ChannelSearch } from "@/components/ChannelSearch";
import { ChannelHeader } from "@/components/ChannelHeader";
import { StatCard } from "@/components/StatCard";
import { HealthScoreGauge } from "@/components/HealthScoreGauge";
import { VideoList } from "@/components/VideoList";
import { InsightsPanel } from "@/components/InsightsPanel";
import { PerformanceCharts } from "@/components/PerformanceCharts";
import { KeywordAnalysisPanel } from "@/components/KeywordAnalysisPanel";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { ReportExport } from "@/components/ReportExport";
import { CompetitorComparison } from "@/components/CompetitorComparison";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { ChannelAnalysis } from "@/types/youtube";
import { 
  Users, 
  Eye, 
  Video, 
  TrendingUp, 
  Clock, 
  BarChart3,
  Youtube,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TabType = "overview" | "performance" | "keywords" | "recommendations" | "compare" | "ai";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ChannelAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const handleSearch = async (channelInput: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/youtube/channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "分析中にエラーが発生しました");
      }

      setAnalysis(data);
      setActiveTab("overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "概要", icon: Layers },
    { id: "performance", label: "パフォーマンス", icon: BarChart3 },
    { id: "keywords", label: "キーワード分析", icon: TrendingUp },
    { id: "recommendations", label: "アクションプラン", icon: Clock },
    { id: "compare", label: "競合比較", icon: Users },
    { id: "ai", label: "AI分析", icon: Sparkles },
  ];

  return (
    <main className="min-h-screen">
      {/* ヘッダー */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">YouTube Channel Analyzer</h1>
                <p className="text-xs text-slate-400">チャンネル分析 & AI インサイト</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ChannelSearch 
          onSearch={handleSearch} 
          isLoading={isLoading} 
        />

        {/* エラー表示 */}
        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析結果 */}
        {analysis && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* チャンネルヘッダー */}
            <ChannelHeader channel={analysis.channel} />

            {/* タブナビゲーション */}
            <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-slate-900/50 border border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                      activeTab === tab.id
                        ? tab.id === "ai" 
                          ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
                          : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 概要タブ */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* 統計カード */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <StatCard
                    title="登録者数"
                    value={analysis.channel.subscriberCount}
                    icon={Users}
                    colorScheme="rose"
                  />
                  <StatCard
                    title="総再生数"
                    value={analysis.channel.viewCount}
                    icon={Eye}
                    colorScheme="sky"
                  />
                  <StatCard
                    title="動画数"
                    value={analysis.channel.videoCount}
                    icon={Video}
                    colorScheme="emerald"
                  />
                  <StatCard
                    title="平均エンゲージメント"
                    value={analysis.averageEngagement}
                    icon={TrendingUp}
                    colorScheme="amber"
                  />
                  <StatCard
                    title="投稿頻度"
                    value={analysis.uploadFrequency}
                    icon={Clock}
                    colorScheme="violet"
                  />
                  <StatCard
                    title="動画あたり平均再生"
                    value={Math.round(analysis.channel.viewCount / analysis.channel.videoCount)}
                    icon={BarChart3}
                    colorScheme="sky"
                  />
                </section>

                {/* ヘルススコアとインサイト */}
                <section className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-6">
                    <HealthScoreGauge score={analysis.healthScore} />
                    <ReportExport analysis={analysis} />
                  </div>
                  <div className="lg:col-span-2">
                    <InsightsPanel insights={analysis.insights} />
                  </div>
                </section>

                {/* 動画リスト */}
                <section>
                  <VideoList videos={analysis.recentVideos} />
                </section>
              </div>
            )}

            {/* パフォーマンスタブ */}
            {activeTab === "performance" && (
              <PerformanceCharts 
                videos={analysis.recentVideos} 
                metrics={analysis.performanceMetrics} 
              />
            )}

            {/* キーワード分析タブ */}
            {activeTab === "keywords" && (
              <KeywordAnalysisPanel analysis={analysis.keywordAnalysis} />
            )}

            {/* アクションプランタブ */}
            {activeTab === "recommendations" && (
              <RecommendationsPanel recommendations={analysis.recommendations} />
            )}

            {/* 競合比較タブ */}
            {activeTab === "compare" && (
              <CompetitorComparison mainChannel={analysis} />
            )}

            {/* AI分析タブ */}
            {activeTab === "ai" && (
              <AIAnalysisPanel analysis={analysis} />
            )}
          </div>
        )}

        {/* 初期状態のプレースホルダー */}
        {!analysis && !isLoading && !error && (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-6">
              <BarChart3 className="h-12 w-12 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              チャンネル分析を開始
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              上のフォームにYouTubeチャンネルのID、ハンドル名、またはURLを入力して分析を開始してください。
            </p>
            
            {/* 機能紹介 */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-5xl mx-auto">
              {[
                { icon: BarChart3, title: "詳細統計", desc: "再生数・エンゲージメントの推移" },
                { icon: TrendingUp, title: "成長分析", desc: "チャンネルヘルススコアの算出" },
                { icon: Layers, title: "キーワード分析", desc: "効果的なタイトル・タグの発見" },
                { icon: Users, title: "競合比較", desc: "他チャンネルとのベンチマーク" },
                { icon: Sparkles, title: "AI分析", desc: "GPT-4による高度な分析", highlight: true },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl border text-center",
                    feature.highlight 
                      ? "bg-violet-500/10 border-violet-500/30" 
                      : "bg-slate-800/30 border-slate-700/50"
                  )}
                >
                  <feature.icon className={cn(
                    "h-8 w-8 mx-auto mb-3",
                    feature.highlight ? "text-violet-400" : "text-slate-500"
                  )} />
                  <h3 className={cn(
                    "font-medium mb-1",
                    feature.highlight ? "text-violet-300" : "text-slate-300"
                  )}>{feature.title}</h3>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ローディング状態 */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 mb-6 animate-pulse">
              <Youtube className="h-12 w-12 text-rose-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              分析中...
            </h2>
            <p className="text-slate-500">
              YouTube Data APIからデータを取得しています
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-rose-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Youtube className="h-4 w-4" />
              <span className="text-sm">YouTube Channel Analyzer v0.3.0</span>
            </div>
            <p className="text-xs text-slate-500">
              YouTube Data API v3 + OpenAI GPT-4を使用 • データはリアルタイムで取得されます
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
