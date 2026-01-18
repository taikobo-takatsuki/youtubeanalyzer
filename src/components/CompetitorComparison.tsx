"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import { ChannelAnalysis } from "@/types/youtube";
import {
  Users,
  Eye,
  Video,
  TrendingUp,
  Search,
  Plus,
  X,
  Loader2,
  Scale,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface CompetitorComparisonProps {
  mainChannel: ChannelAnalysis;
}

interface CompetitorData {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  avgEngagement: string;
}

export function CompetitorComparison({ mainChannel }: CompetitorComparisonProps) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addCompetitor = async () => {
    if (!searchInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/youtube/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelInput: searchInput.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "チャンネルの取得に失敗しました");
      }

      const data: ChannelAnalysis = await response.json();
      
      // 既に追加済みかチェック
      if (competitors.some((c) => c.id === data.channel.id)) {
        setError("このチャンネルは既に追加されています");
        return;
      }

      // メインチャンネルと同じかチェック
      if (data.channel.id === mainChannel.channel.id) {
        setError("分析中のチャンネルと同じです");
        return;
      }

      setCompetitors((prev) => [
        ...prev,
        {
          id: data.channel.id,
          title: data.channel.title,
          thumbnailUrl: data.channel.thumbnailUrl,
          subscriberCount: data.channel.subscriberCount,
          viewCount: data.channel.viewCount,
          videoCount: data.channel.videoCount,
          avgEngagement: data.averageEngagement,
        },
      ]);
      setSearchInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const removeCompetitor = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const compareValue = (main: number, competitor: number): { ratio: number; trend: "up" | "down" | "equal" } => {
    if (competitor === 0) return { ratio: 0, trend: "equal" };
    const ratio = ((main - competitor) / competitor) * 100;
    return {
      ratio: Math.round(ratio),
      trend: ratio > 5 ? "up" : ratio < -5 ? "down" : "equal",
    };
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "equal" }) => {
    if (trend === "up") return <ArrowUp className="h-4 w-4 text-emerald-400" />;
    if (trend === "down") return <ArrowDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Scale className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-lg">競合チャンネル比較</CardTitle>
            <CardDescription>他チャンネルとのベンチマーク分析</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 検索入力 */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="競合チャンネルのID、ハンドル名、またはURL"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={addCompetitor}
            disabled={isLoading || !searchInput.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            追加
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}

        {/* 比較テーブル */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">チャンネル</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="h-4 w-4" />
                    登録者
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  <div className="flex items-center justify-end gap-1">
                    <Eye className="h-4 w-4" />
                    総再生数
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  <div className="flex items-center justify-end gap-1">
                    <Video className="h-4 w-4" />
                    動画数
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="h-4 w-4" />
                    エンゲージメント
                  </div>
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {/* メインチャンネル */}
              <tr className="border-b border-slate-800 bg-gradient-to-r from-rose-500/10 to-orange-500/10">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={mainChannel.channel.thumbnailUrl}
                      alt={mainChannel.channel.title}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-white">{mainChannel.channel.title}</p>
                      <Badge variant="default" className="text-xs">分析中</Badge>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-white">
                  {formatNumber(mainChannel.channel.subscriberCount)}
                </td>
                <td className="py-4 px-4 text-right font-medium text-white">
                  {formatNumber(mainChannel.channel.viewCount)}
                </td>
                <td className="py-4 px-4 text-right font-medium text-white">
                  {formatNumber(mainChannel.channel.videoCount)}
                </td>
                <td className="py-4 px-4 text-right font-medium text-white">
                  {mainChannel.averageEngagement}
                </td>
                <td></td>
              </tr>

              {/* 競合チャンネル */}
              {competitors.map((competitor) => {
                const subComp = compareValue(mainChannel.channel.subscriberCount, competitor.subscriberCount);
                const viewComp = compareValue(mainChannel.channel.viewCount, competitor.viewCount);
                const videoComp = compareValue(mainChannel.channel.videoCount, competitor.videoCount);

                return (
                  <tr key={competitor.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={competitor.thumbnailUrl}
                          alt={competitor.title}
                          className="w-10 h-10 rounded-full"
                        />
                        <p className="font-medium text-slate-200">{competitor.title}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-slate-300">{formatNumber(competitor.subscriberCount)}</span>
                        <div className="flex items-center gap-1 text-xs">
                          <TrendIcon trend={subComp.trend} />
                          <span className={cn(
                            subComp.trend === "up" ? "text-emerald-400" :
                            subComp.trend === "down" ? "text-red-400" : "text-slate-400"
                          )}>
                            {subComp.ratio > 0 ? "+" : ""}{subComp.ratio}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-slate-300">{formatNumber(competitor.viewCount)}</span>
                        <div className="flex items-center gap-1 text-xs">
                          <TrendIcon trend={viewComp.trend} />
                          <span className={cn(
                            viewComp.trend === "up" ? "text-emerald-400" :
                            viewComp.trend === "down" ? "text-red-400" : "text-slate-400"
                          )}>
                            {viewComp.ratio > 0 ? "+" : ""}{viewComp.ratio}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-slate-300">{formatNumber(competitor.videoCount)}</span>
                        <div className="flex items-center gap-1 text-xs">
                          <TrendIcon trend={videoComp.trend} />
                          <span className={cn(
                            videoComp.trend === "up" ? "text-emerald-400" :
                            videoComp.trend === "down" ? "text-red-400" : "text-slate-400"
                          )}>
                            {videoComp.ratio > 0 ? "+" : ""}{videoComp.ratio}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-slate-300">
                      {competitor.avgEngagement}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => removeCompetitor(competitor.id)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {competitors.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>競合チャンネルを追加して比較分析を開始</p>
            <p className="text-sm mt-1">上の検索ボックスからチャンネルを追加してください</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
