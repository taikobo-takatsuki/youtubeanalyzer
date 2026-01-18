"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChannelAnalysis } from "@/types/youtube";
import type { 
  ThumbnailAnalysis, 
  TitleSEOAnalysis, 
  DescriptionAnalysis, 
  VideoThemeSuggestion 
} from "@/types/ai";
import {
  Sparkles,
  Image as ImageIcon,
  Type,
  FileText,
  Lightbulb,
  Target,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Eye,
  Palette,
  Heart,
  MousePointer,
  Search,
  Hash,
  Link,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface AIAnalysisPanelProps {
  analysis: ChannelAnalysis;
}

type AnalysisType = "thumbnail" | "title" | "description" | "themes" | "swot";

interface AnalysisState {
  thumbnail: { loading: boolean; data: ThumbnailAnalysis | null; error: string | null };
  title: { loading: boolean; data: TitleSEOAnalysis | null; error: string | null };
  description: { loading: boolean; data: DescriptionAnalysis | null; error: string | null };
  themes: { loading: boolean; data: VideoThemeSuggestion[] | null; error: string | null };
  swot: { loading: boolean; data: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } | null; error: string | null };
}

export function AIAnalysisPanel({ analysis }: AIAnalysisPanelProps) {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    thumbnail: { loading: false, data: null, error: null },
    title: { loading: false, data: null, error: null },
    description: { loading: false, data: null, error: null },
    themes: { loading: false, data: null, error: null },
    swot: { loading: false, data: null, error: null },
  });

  const currentVideo = analysis.recentVideos[selectedVideo];

  const runAnalysis = async (type: AnalysisType) => {
    setAnalysisState(prev => ({
      ...prev,
      [type]: { loading: true, data: null, error: null }
    }));

    try {
      const requestBody: Record<string, unknown> = {
        type,
      };

      switch (type) {
        case "thumbnail":
          requestBody.thumbnailUrl = currentVideo.thumbnailUrl;
          break;
        case "title":
          requestBody.title = currentVideo.title;
          requestBody.channelNiche = analysis.channel.description.substring(0, 100);
          break;
        case "description":
          requestBody.title = currentVideo.title;
          requestBody.description = currentVideo.description;
          break;
        case "themes":
          requestBody.channelTitle = analysis.channel.title;
          requestBody.recentTitles = analysis.recentVideos.map(v => v.title);
          requestBody.topKeywords = analysis.keywordAnalysis.topKeywords.map(k => k.word);
          requestBody.avgViews = analysis.performanceMetrics.averageViews;
          break;
        case "swot":
          requestBody.channelTitle = analysis.channel.title;
          requestBody.channelDescription = analysis.channel.description;
          requestBody.recentTitles = analysis.recentVideos.map(v => v.title);
          break;
      }

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "分析に失敗しました");
      }

      setAnalysisState(prev => ({
        ...prev,
        [type]: { loading: false, data: result.data, error: null }
      }));
      setExpandedSection(type);
    } catch (error) {
      setAnalysisState(prev => ({
        ...prev,
        [type]: { loading: false, data: null, error: error instanceof Error ? error.message : "エラーが発生しました" }
      }));
    }
  };

  const ScoreBar = ({ score, label }: { score: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={cn(
          "font-medium",
          score >= 80 ? "text-emerald-400" :
          score >= 60 ? "text-amber-400" :
          "text-red-400"
        )}>{score}/100</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
            score >= 60 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
            "bg-gradient-to-r from-red-500 to-rose-400"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 動画選択 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">AI高度分析</CardTitle>
              <CardDescription>OpenAI GPT-4による詳細分析</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block">分析する動画を選択:</label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-violet-500 focus:outline-none"
            >
              {analysis.recentVideos.map((video, index) => (
                <option key={video.id} value={index}>
                  {index + 1}. {video.title.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {/* 分析ボタングリッド */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* サムネイル分析 */}
            <Button
              variant="outline"
              className={cn(
                "h-auto py-4 flex flex-col items-center gap-2",
                analysisState.thumbnail.data && "border-emerald-500/50 bg-emerald-500/10"
              )}
              onClick={() => runAnalysis("thumbnail")}
              disabled={analysisState.thumbnail.loading}
            >
              {analysisState.thumbnail.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              ) : analysisState.thumbnail.data ? (
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              ) : (
                <ImageIcon className="h-6 w-6 text-violet-400" />
              )}
              <span className="text-xs">サムネイル</span>
            </Button>

            {/* タイトルSEO */}
            <Button
              variant="outline"
              className={cn(
                "h-auto py-4 flex flex-col items-center gap-2",
                analysisState.title.data && "border-emerald-500/50 bg-emerald-500/10"
              )}
              onClick={() => runAnalysis("title")}
              disabled={analysisState.title.loading}
            >
              {analysisState.title.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              ) : analysisState.title.data ? (
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              ) : (
                <Type className="h-6 w-6 text-violet-400" />
              )}
              <span className="text-xs">タイトルSEO</span>
            </Button>

            {/* 説明文分析 */}
            <Button
              variant="outline"
              className={cn(
                "h-auto py-4 flex flex-col items-center gap-2",
                analysisState.description.data && "border-emerald-500/50 bg-emerald-500/10"
              )}
              onClick={() => runAnalysis("description")}
              disabled={analysisState.description.loading}
            >
              {analysisState.description.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              ) : analysisState.description.data ? (
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              ) : (
                <FileText className="h-6 w-6 text-violet-400" />
              )}
              <span className="text-xs">説明文</span>
            </Button>

            {/* テーマ提案 */}
            <Button
              variant="outline"
              className={cn(
                "h-auto py-4 flex flex-col items-center gap-2",
                analysisState.themes.data && "border-emerald-500/50 bg-emerald-500/10"
              )}
              onClick={() => runAnalysis("themes")}
              disabled={analysisState.themes.loading}
            >
              {analysisState.themes.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              ) : analysisState.themes.data ? (
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              ) : (
                <Lightbulb className="h-6 w-6 text-violet-400" />
              )}
              <span className="text-xs">テーマ提案</span>
            </Button>

            {/* SWOT分析 */}
            <Button
              variant="outline"
              className={cn(
                "h-auto py-4 flex flex-col items-center gap-2",
                analysisState.swot.data && "border-emerald-500/50 bg-emerald-500/10"
              )}
              onClick={() => runAnalysis("swot")}
              disabled={analysisState.swot.loading}
            >
              {analysisState.swot.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              ) : analysisState.swot.data ? (
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              ) : (
                <Target className="h-6 w-6 text-violet-400" />
              )}
              <span className="text-xs">SWOT分析</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* サムネイル分析結果 */}
      {analysisState.thumbnail.data && (
        <Card className="border-violet-500/30">
          <CardHeader className="pb-4 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "thumbnail" ? null : "thumbnail")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <ImageIcon className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">サムネイル分析</CardTitle>
                  <CardDescription>GPT-4 Visionによる画像分析</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={analysisState.thumbnail.data.overallScore >= 70 ? "success" : "warning"}>
                  スコア: {analysisState.thumbnail.data.overallScore}/100
                </Badge>
                {expandedSection === "thumbnail" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
          {expandedSection === "thumbnail" && (
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <img
                  src={currentVideo.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-48 h-28 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-3">
                  <ScoreBar score={analysisState.thumbnail.data.textVisibility.score} label="テキスト視認性" />
                  <ScoreBar score={analysisState.thumbnail.data.composition.score} label="構図" />
                  <ScoreBar score={analysisState.thumbnail.data.colorScheme.score} label="色彩" />
                  <ScoreBar score={analysisState.thumbnail.data.emotionalImpact.score} label="感情的インパクト" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-sky-400" />
                    <h4 className="font-medium text-white">テキスト視認性</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{analysisState.thumbnail.data.textVisibility.feedback}</p>
                  <ul className="space-y-1">
                    {analysisState.thumbnail.data.textVisibility.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-0.5 text-violet-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4 text-rose-400" />
                    <h4 className="font-medium text-white">色彩分析</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{analysisState.thumbnail.data.colorScheme.feedback}</p>
                  <div className="flex gap-2 mb-3">
                    {analysisState.thumbnail.data.colorScheme.dominantColors.map((color, i) => (
                      <Badge key={i} variant="outline">{color}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  <h4 className="font-medium text-amber-300">改善提案</h4>
                </div>
                <ul className="space-y-2">
                  {analysisState.thumbnail.data.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* タイトルSEO分析結果 */}
      {analysisState.title.data && (
        <Card className="border-violet-500/30">
          <CardHeader className="pb-4 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "title" ? null : "title")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Type className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">タイトルSEO分析</CardTitle>
                  <CardDescription>{currentVideo.title.substring(0, 40)}...</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={analysisState.title.data.overallScore >= 70 ? "success" : "warning"}>
                  スコア: {analysisState.title.data.overallScore}/100
                </Badge>
                {expandedSection === "title" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
          {expandedSection === "title" && (
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <ScoreBar score={analysisState.title.data.keywordOptimization.score} label="キーワード最適化" />
                <ScoreBar score={analysisState.title.data.clickTriggers.score} label="クリックトリガー" />
                <ScoreBar score={analysisState.title.data.lengthAnalysis.score} label="長さ最適化" />
                <ScoreBar score={analysisState.title.data.emotionalAppeal.score} label="感情的アピール" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4 text-emerald-400" />
                    検出されたキーワード
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisState.title.data.keywordOptimization.detectedKeywords.map((k, i) => (
                      <Badge key={i} variant="success">{k}</Badge>
                    ))}
                  </div>
                  {analysisState.title.data.keywordOptimization.missingKeywords.length > 0 && (
                    <>
                      <h5 className="text-sm text-slate-400 mt-4 mb-2">追加推奨キーワード:</h5>
                      <div className="flex flex-wrap gap-2">
                        {analysisState.title.data.keywordOptimization.missingKeywords.map((k, i) => (
                          <Badge key={i} variant="warning">{k}</Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-rose-400" />
                    クリックトリガー
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {analysisState.title.data.clickTriggers.detected.map((t, i) => (
                      <Badge key={i} variant="info">{t}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">追加提案:</p>
                  <ul className="mt-2 space-y-1">
                    {analysisState.title.data.clickTriggers.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-slate-300">• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="font-medium text-emerald-300 mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  改善されたタイトル案
                </h4>
                <ul className="space-y-2">
                  {analysisState.title.data.improvements.map((title, i) => (
                    <li key={i} className="p-3 rounded-lg bg-slate-800/50 text-white text-sm">
                      {i + 1}. {title}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* 説明文分析結果 */}
      {analysisState.description.data && (
        <Card className="border-violet-500/30">
          <CardHeader className="pb-4 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "description" ? null : "description")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <FileText className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">説明文分析</CardTitle>
                  <CardDescription>SEO・CTA・構造の最適化</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={analysisState.description.data.overallScore >= 70 ? "success" : "warning"}>
                  スコア: {analysisState.description.data.overallScore}/100
                </Badge>
                {expandedSection === "description" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
          {expandedSection === "description" && (
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <ScoreBar score={analysisState.description.data.seoOptimization.score} label="SEO最適化" />
                <ScoreBar score={analysisState.description.data.ctaAnalysis.score} label="CTA" />
                <ScoreBar score={analysisState.description.data.structure.score} label="構造" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-sky-400" />
                    <span className="text-sm text-slate-300">タイムスタンプ</span>
                  </div>
                  <Badge variant={analysisState.description.data.structure.hasTimestamps ? "success" : "danger"}>
                    {analysisState.description.data.structure.hasTimestamps ? "あり" : "なし"}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-slate-300">リンク</span>
                  </div>
                  <Badge variant={analysisState.description.data.structure.hasLinks ? "success" : "warning"}>
                    {analysisState.description.data.structure.hasLinks ? "あり" : "なし"}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-violet-400" />
                    <span className="text-sm text-slate-300">ハッシュタグ</span>
                  </div>
                  <Badge variant={analysisState.description.data.structure.hasHashtags ? "success" : "warning"}>
                    {analysisState.description.data.structure.hasHashtags ? "あり" : "なし"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="font-medium text-emerald-300 mb-3">改善された説明文の例</h4>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-4 rounded-lg">
                  {analysisState.description.data.improvedDescription}
                </pre>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* テーマ提案結果 */}
      {analysisState.themes.data && (
        <Card className="border-violet-500/30">
          <CardHeader className="pb-4 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "themes" ? null : "themes")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Lightbulb className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">次回動画テーマ提案</CardTitle>
                  <CardDescription>AIによる5つのテーマ提案</CardDescription>
                </div>
              </div>
              {expandedSection === "themes" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSection === "themes" && (
            <CardContent className="space-y-4">
              {analysisState.themes.data.map((theme, index) => (
                <div
                  key={theme.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    theme.expectedPerformance === "high" 
                      ? "border-emerald-500/30 bg-emerald-500/5" 
                      : theme.expectedPerformance === "medium"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-slate-700 bg-slate-800/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-white">{theme.title}</h4>
                        <p className="text-sm text-slate-400">{theme.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        theme.expectedPerformance === "high" ? "success" : 
                        theme.expectedPerformance === "medium" ? "warning" : "outline"
                      }
                    >
                      {theme.expectedPerformance === "high" ? "高パフォーマンス予測" :
                       theme.expectedPerformance === "medium" ? "中パフォーマンス予測" : "低パフォーマンス予測"}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">{theme.reasoning}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-violet-400" />
                    <span className="text-xs text-slate-400">トレンド関連度:</span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                        style={{ width: `${theme.trendRelevance}%` }}
                      />
                    </div>
                    <span className="text-xs text-violet-400">{theme.trendRelevance}%</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {theme.suggestedTags.map((tag, i) => (
                      <Badge key={i} variant="purple" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* SWOT分析結果 */}
      {analysisState.swot.data && (
        <Card className="border-violet-500/30">
          <CardHeader className="pb-4 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "swot" ? null : "swot")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Target className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">SWOT分析</CardTitle>
                  <CardDescription>チャンネルの戦略的ポジション分析</CardDescription>
                </div>
              </div>
              {expandedSection === "swot" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSection === "swot" && (
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="font-medium text-emerald-300 mb-3">💪 強み (Strengths)</h4>
                  <ul className="space-y-2">
                    {analysisState.swot.data.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <h4 className="font-medium text-red-300 mb-3">⚠️ 弱み (Weaknesses)</h4>
                  <ul className="space-y-2">
                    {analysisState.swot.data.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
                  <h4 className="font-medium text-sky-300 mb-3">🚀 機会 (Opportunities)</h4>
                  <ul className="space-y-2">
                    {analysisState.swot.data.opportunities.map((o, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <h4 className="font-medium text-amber-300 mb-3">⚡ 脅威 (Threats)</h4>
                  <ul className="space-y-2">
                    {analysisState.swot.data.threats.map((t, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <Zap className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* エラー表示 */}
      {Object.entries(analysisState).map(([key, state]) => 
        state.error && (
          <Card key={key} className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>{state.error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => runAnalysis(key as AnalysisType)}
                  className="ml-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  再試行
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
