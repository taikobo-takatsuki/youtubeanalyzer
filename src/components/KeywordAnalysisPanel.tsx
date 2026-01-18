"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KeywordAnalysis } from "@/types/youtube";
import { formatNumber } from "@/lib/utils";
import {
  Search,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
  Tag,
  Type,
  BarChart2,
} from "lucide-react";

interface KeywordAnalysisPanelProps {
  analysis: KeywordAnalysis;
}

export function KeywordAnalysisPanel({ analysis }: KeywordAnalysisPanelProps) {
  const performanceColors = {
    high: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    medium: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    low: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30" },
  };

  const PerformanceIcon = {
    high: TrendingUp,
    medium: Minus,
    low: TrendingDown,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* キーワード分析 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <Search className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">キーワード分析</CardTitle>
              <CardDescription>タイトルで頻出するキーワード</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analysis.topKeywords.length > 0 ? (
            <div className="space-y-3">
              {analysis.topKeywords.slice(0, 8).map((keyword, index) => {
                const colors = performanceColors[keyword.performance];
                const Icon = PerformanceIcon[keyword.performance];
                
                return (
                  <div
                    key={keyword.word}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md",
                      colors.border,
                      colors.bg
                    )}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-300">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium text-white truncate">
                      {keyword.word}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">
                        {keyword.count}回
                      </span>
                      <div className="flex items-center gap-1">
                        <Icon className={cn("h-4 w-4", colors.text)} />
                        <span className={colors.text}>
                          平均 {formatNumber(keyword.avgViews)}再生
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>キーワードデータがありません</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* タイトルパターン & ハッシュタグ */}
      <div className="space-y-6">
        {/* タイトルパターン */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <Type className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-lg">タイトルパターン</CardTitle>
                <CardDescription>効果的なタイトル形式</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analysis.titlePatterns.length > 0 ? (
              <div className="space-y-3">
                {analysis.titlePatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{pattern.pattern}</span>
                      <Badge variant={pattern.effectiveness > 60 ? "success" : pattern.effectiveness > 40 ? "warning" : "outline"}>
                        効果: {Math.round(pattern.effectiveness)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{pattern.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pattern.effectiveness > 60 
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : pattern.effectiveness > 40
                                ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                : "bg-gradient-to-r from-slate-500 to-slate-400"
                          )}
                          style={{ width: `${pattern.effectiveness}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{pattern.count}本</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Type className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">パターンデータがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ハッシュタグ使用状況 */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20">
                <Hash className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg">ハッシュタグ</CardTitle>
                <CardDescription>説明文で使用されているタグ</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analysis.hashtagUsage.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.hashtagUsage.map((hashtag, index) => (
                  <Badge
                    key={index}
                    variant="info"
                    className="px-3 py-1.5 text-sm"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {hashtag.tag}
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-sky-500/30 text-xs">
                      {hashtag.count}
                    </span>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Hash className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ハッシュタグが検出されませんでした</p>
                <p className="text-xs mt-1">説明文に#タグを追加することを検討してください</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
