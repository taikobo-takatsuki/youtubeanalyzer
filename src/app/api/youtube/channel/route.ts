import { NextRequest, NextResponse } from "next/server";
import type { 
  ChannelInfo, 
  VideoInfo, 
  ChannelAnalysis, 
  AnalysisInsight,
  PerformanceMetrics,
  KeywordAnalysis,
  KeywordItem,
  TitlePattern,
  Recommendation,
  ENGAGEMENT_BENCHMARKS,
  CHANNEL_SIZE_BENCHMARKS,
} from "@/types/youtube";
import { getChannelSize } from "@/types/youtube";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// 業界ベンチマーク
const BENCHMARKS = {
  engagement: {
    excellent: 6.0,
    good: 3.5,
    average: 2.0,
    belowAverage: 1.0,
    poor: 0.5,
  },
  channelSize: {
    micro: { min: 0, max: 10000, avgEngagement: 8.0 },
    small: { min: 10000, max: 100000, avgEngagement: 4.5 },
    medium: { min: 100000, max: 1000000, avgEngagement: 3.0 },
    large: { min: 1000000, max: 10000000, avgEngagement: 2.0 },
    mega: { min: 10000000, max: Infinity, avgEngagement: 1.5 },
  },
};

async function fetchChannelByHandle(handle: string, apiKey: string): Promise<string | null> {
  const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${apiKey}`;
  const response = await fetch(searchUrl);
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    return data.items[0].snippet.channelId;
  }
  return null;
}

async function fetchChannelInfo(channelId: string, apiKey: string): Promise<ChannelInfo | null> {
  const url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return null;
  }

  const channel = data.items[0];
  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl || "",
    thumbnailUrl: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
    subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
    viewCount: parseInt(channel.statistics.viewCount) || 0,
    videoCount: parseInt(channel.statistics.videoCount) || 0,
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country,
  };
}

async function fetchRecentVideos(channelId: string, apiKey: string, maxResults: number = 10): Promise<VideoInfo[]> {
  const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${apiKey}`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(",");
  const videosUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
  const videosResponse = await fetch(videosUrl);
  const videosData = await videosResponse.json();

  return videosData.items.map((video: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      publishedAt: string;
      tags?: string[];
    };
    statistics: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    contentDetails: {
      duration: string;
    };
  }) => {
    const viewCount = parseInt(video.statistics.viewCount) || 0;
    const likeCount = parseInt(video.statistics.likeCount) || 0;
    const commentCount = parseInt(video.statistics.commentCount) || 0;
    const engagementRate = viewCount > 0 
      ? (((likeCount + commentCount) / viewCount) * 100).toFixed(2) + "%"
      : "0.00%";

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
      publishedAt: video.snippet.publishedAt,
      viewCount,
      likeCount,
      commentCount,
      duration: video.contentDetails.duration,
      engagementRate,
      tags: video.snippet.tags || [],
    };
  });
}

function analyzeKeywords(videos: VideoInfo[]): KeywordAnalysis {
  const wordCounts: Map<string, { count: number; totalViews: number }> = new Map();
  const hashtagCounts: Map<string, number> = new Map();
  const patterns: TitlePattern[] = [];

  // タイトルからキーワードを抽出
  videos.forEach((video) => {
    // 日本語と英語の単語を抽出（2文字以上）
    const words = video.title.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,}|[a-zA-Z]{3,}/g) || [];
    words.forEach((word) => {
      const lower = word.toLowerCase();
      const existing = wordCounts.get(lower) || { count: 0, totalViews: 0 };
      wordCounts.set(lower, {
        count: existing.count + 1,
        totalViews: existing.totalViews + video.viewCount,
      });
    });

    // ハッシュタグを抽出
    const hashtags = video.description.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || [];
    hashtags.forEach((tag) => {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
    });
  });

  // キーワードをソートしてトップ10を取得
  const avgViewsOverall = videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length;
  const topKeywords: KeywordItem[] = Array.from(wordCounts.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      avgViews: Math.round(data.totalViews / data.count),
      performance: data.totalViews / data.count > avgViewsOverall * 1.2 
        ? "high" as const
        : data.totalViews / data.count > avgViewsOverall * 0.8 
          ? "medium" as const 
          : "low" as const,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // タイトルパターン分析
  const hasNumbers = videos.filter((v) => /\d+/.test(v.title)).length;
  const hasQuestions = videos.filter((v) => /[?？]/.test(v.title)).length;
  const hasBrackets = videos.filter((v) => /[\[\]【】]/.test(v.title)).length;
  const hasEmoji = videos.filter((v) => /[\u{1F300}-\u{1F9FF}]/u.test(v.title)).length;

  if (hasNumbers > 0) {
    patterns.push({
      pattern: "数字を含むタイトル",
      description: "「5つの方法」「10分で分かる」など",
      count: hasNumbers,
      effectiveness: calculatePatternEffectiveness(videos, (v) => /\d+/.test(v.title)),
    });
  }
  if (hasQuestions > 0) {
    patterns.push({
      pattern: "疑問形タイトル",
      description: "「なぜ？」「どうすれば？」など",
      count: hasQuestions,
      effectiveness: calculatePatternEffectiveness(videos, (v) => /[?？]/.test(v.title)),
    });
  }
  if (hasBrackets > 0) {
    patterns.push({
      pattern: "括弧を使用",
      description: "【重要】[解説]など強調表現",
      count: hasBrackets,
      effectiveness: calculatePatternEffectiveness(videos, (v) => /[\[\]【】]/.test(v.title)),
    });
  }
  if (hasEmoji > 0) {
    patterns.push({
      pattern: "絵文字を使用",
      description: "タイトルに絵文字で視覚的アピール",
      count: hasEmoji,
      effectiveness: calculatePatternEffectiveness(videos, (v) => /[\u{1F300}-\u{1F9FF}]/u.test(v.title)),
    });
  }

  const hashtagUsage = Array.from(hashtagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    topKeywords,
    titlePatterns: patterns,
    hashtagUsage,
  };
}

function calculatePatternEffectiveness(videos: VideoInfo[], filter: (v: VideoInfo) => boolean): number {
  const matching = videos.filter(filter);
  const notMatching = videos.filter((v) => !filter(v));
  
  if (matching.length === 0 || notMatching.length === 0) return 50;
  
  const avgMatching = matching.reduce((sum, v) => sum + v.viewCount, 0) / matching.length;
  const avgNotMatching = notMatching.reduce((sum, v) => sum + v.viewCount, 0) / notMatching.length;
  
  const ratio = avgMatching / avgNotMatching;
  return Math.min(100, Math.max(0, ratio * 50));
}

function calculatePerformanceMetrics(channel: ChannelInfo, videos: VideoInfo[]): PerformanceMetrics {
  const avgViews = videos.length > 0 
    ? videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length 
    : 0;
  const avgLikes = videos.length > 0 
    ? videos.reduce((sum, v) => sum + v.likeCount, 0) / videos.length 
    : 0;
  const avgComments = videos.length > 0 
    ? videos.reduce((sum, v) => sum + v.commentCount, 0) / videos.length 
    : 0;

  // エンゲージメントトレンド（直近5本 vs 過去5本）
  let engagementTrend: "up" | "down" | "stable" = "stable";
  if (videos.length >= 6) {
    const recent = videos.slice(0, 3);
    const older = videos.slice(-3);
    const recentAvg = recent.reduce((sum, v) => sum + parseFloat(v.engagementRate), 0) / 3;
    const olderAvg = older.reduce((sum, v) => sum + parseFloat(v.engagementRate), 0) / 3;
    if (recentAvg > olderAvg * 1.1) engagementTrend = "up";
    else if (recentAvg < olderAvg * 0.9) engagementTrend = "down";
  }

  // トップパフォーマンス動画
  const topPerformingVideo = videos.length > 0 
    ? videos.reduce((top, v) => v.viewCount > top.viewCount ? v : top, videos[0])
    : null;

  // 再生数成長率（直近の動画 vs 平均）
  const viewsGrowthRate = videos.length > 0 && avgViews > 0
    ? ((videos[0].viewCount - avgViews) / avgViews) * 100
    : 0;

  return {
    viewsPerVideo: Math.round(channel.viewCount / Math.max(channel.videoCount, 1)),
    subscribersPerVideo: Math.round(channel.subscriberCount / Math.max(channel.videoCount, 1)),
    engagementTrend,
    topPerformingVideo,
    averageViews: Math.round(avgViews),
    averageLikes: Math.round(avgLikes),
    averageComments: Math.round(avgComments),
    viewsGrowthRate: Math.round(viewsGrowthRate * 10) / 10,
  };
}

function generateInsights(channel: ChannelInfo, videos: VideoInfo[], metrics: PerformanceMetrics): AnalysisInsight[] {
  const insights: AnalysisInsight[] = [];
  const channelSize = getChannelSize(channel.subscriberCount);
  const benchmark = BENCHMARKS.channelSize[channelSize];

  // 平均エンゲージメント率の計算
  const avgEngagement = videos.length > 0
    ? videos.reduce((sum, v) => sum + parseFloat(v.engagementRate), 0) / videos.length
    : 0;

  // チャンネル規模に応じたエンゲージメント分析
  const engagementRatio = avgEngagement / benchmark.avgEngagement;
  
  if (engagementRatio >= 1.2) {
    insights.push({
      id: "engagement-1",
      category: "engagement",
      status: "good",
      title: "優秀なエンゲージメント率",
      description: `平均エンゲージメント率${avgEngagement.toFixed(2)}%は、同規模チャンネル（${channelSize}）の平均${benchmark.avgEngagement}%を上回っています。`,
      recommendation: "この調子を維持してください！視聴者との良好な関係が築けています。",
      metric: {
        current: avgEngagement,
        benchmark: benchmark.avgEngagement,
        unit: "%",
      },
    });
  } else if (engagementRatio >= 0.8) {
    insights.push({
      id: "engagement-1",
      category: "engagement",
      status: "warning",
      title: "エンゲージメント率は標準的",
      description: `平均エンゲージメント率${avgEngagement.toFixed(2)}%は、同規模チャンネルの平均${benchmark.avgEngagement}%とほぼ同等です。`,
      recommendation: "コメント返信やコミュニティ投稿で視聴者との対話を増やしましょう。",
      metric: {
        current: avgEngagement,
        benchmark: benchmark.avgEngagement,
        unit: "%",
      },
    });
  } else {
    insights.push({
      id: "engagement-1",
      category: "engagement",
      status: "critical",
      title: "エンゲージメント率が低め",
      description: `平均エンゲージメント率${avgEngagement.toFixed(2)}%は、同規模チャンネルの平均${benchmark.avgEngagement}%を下回っています。`,
      recommendation: "動画内でCTA（いいね・コメントの促し）を明確にし、視聴者参加型のコンテンツを検討してください。",
      metric: {
        current: avgEngagement,
        benchmark: benchmark.avgEngagement,
        unit: "%",
      },
    });
  }

  // エンゲージメントトレンド分析
  if (metrics.engagementTrend === "up") {
    insights.push({
      id: "engagement-trend",
      category: "engagement",
      status: "good",
      title: "エンゲージメントが上昇傾向",
      description: "直近の動画は過去の動画と比べてエンゲージメント率が向上しています。",
      recommendation: "現在の戦略が効果的です。成功要因を分析して継続しましょう。",
    });
  } else if (metrics.engagementTrend === "down") {
    insights.push({
      id: "engagement-trend",
      category: "engagement",
      status: "warning",
      title: "エンゲージメントが下降傾向",
      description: "直近の動画のエンゲージメント率が低下しています。",
      recommendation: "コンテンツの方向性や視聴者のニーズを再確認しましょう。",
    });
  }

  // タイトル分析
  const titlesWithNumbers = videos.filter((v) => /\d+/.test(v.title)).length;
  const titlesWithBrackets = videos.filter((v) => /[\[\]【】]/.test(v.title)).length;
  
  if (titlesWithNumbers >= videos.length * 0.4) {
    insights.push({
      id: "title-numbers",
      category: "title",
      status: "good",
      title: "数字を効果的に活用",
      description: `${Math.round(titlesWithNumbers / videos.length * 100)}%のタイトルに具体的な数字が含まれています。`,
      recommendation: "数字はクリック率を高める効果があります。引き続き活用しましょう。",
    });
  } else {
    insights.push({
      id: "title-numbers",
      category: "title",
      status: "warning",
      title: "タイトルに数字を増やす余地",
      description: "タイトルに具体的な数字を含めることでクリック率が向上する可能性があります。",
      recommendation: "「〇〇の5つの方法」「10分で分かる」など、数字を活用してみましょう。",
    });
  }

  if (titlesWithBrackets >= videos.length * 0.3) {
    insights.push({
      id: "title-brackets",
      category: "title",
      status: "good",
      title: "強調表現を活用",
      description: "【】や[]を使った強調表現が効果的に使用されています。",
    });
  }

  // 投稿頻度分析
  if (videos.length >= 2) {
    const dates = videos.map((v) => new Date(v.publishedAt).getTime()).sort((a, b) => b - a);
    const daysBetween = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
    const avgDaysBetweenVideos = daysBetween / (videos.length - 1);

    const frequencyBenchmark = channelSize === "micro" || channelSize === "small" ? 14 : 7;

    if (avgDaysBetweenVideos <= frequencyBenchmark * 0.7) {
      insights.push({
        id: "frequency-1",
        category: "frequency",
        status: "good",
        title: "安定した投稿頻度",
        description: `平均${avgDaysBetweenVideos.toFixed(1)}日ごとに動画を投稿しており、アルゴリズムに好まれる頻度です。`,
        recommendation: "一貫した投稿スケジュールを維持してください。",
        metric: {
          current: avgDaysBetweenVideos,
          benchmark: frequencyBenchmark,
          unit: "日",
        },
      });
    } else if (avgDaysBetweenVideos <= frequencyBenchmark * 1.5) {
      insights.push({
        id: "frequency-1",
        category: "frequency",
        status: "warning",
        title: "投稿頻度を上げることを検討",
        description: `平均${avgDaysBetweenVideos.toFixed(1)}日ごとの投稿です。`,
        recommendation: "可能であれば投稿頻度を上げることで、視聴者の定着率が向上します。",
        metric: {
          current: avgDaysBetweenVideos,
          benchmark: frequencyBenchmark,
          unit: "日",
        },
      });
    } else {
      insights.push({
        id: "frequency-1",
        category: "frequency",
        status: "critical",
        title: "投稿頻度が低い",
        description: `平均${avgDaysBetweenVideos.toFixed(1)}日ごとの投稿で、頻度が低めです。`,
        recommendation: "定期的な投稿はアルゴリズムに好まれます。コンテンツカレンダーを作成しましょう。",
        metric: {
          current: avgDaysBetweenVideos,
          benchmark: frequencyBenchmark,
          unit: "日",
        },
      });
    }
  }

  // SEO分析（説明文とタグ）
  const avgDescLength = videos.reduce((sum, v) => sum + v.description.length, 0) / videos.length;
  const avgTagCount = videos.reduce((sum, v) => sum + (v.tags?.length || 0), 0) / videos.length;

  if (avgDescLength < 200) {
    insights.push({
      id: "seo-desc",
      category: "seo",
      status: "warning",
      title: "説明文が短め",
      description: `平均説明文は${Math.round(avgDescLength)}文字です。より詳細な説明でSEOを改善できます。`,
      recommendation: "説明文に関連キーワード、タイムスタンプ、関連リンクを追加しましょう。",
    });
  } else {
    insights.push({
      id: "seo-desc",
      category: "seo",
      status: "good",
      title: "説明文が充実",
      description: `平均${Math.round(avgDescLength)}文字の説明文でSEOに効果的です。`,
    });
  }

  // サムネイル分析（Mock）
  insights.push({
    id: "thumbnail-1",
    category: "thumbnail",
    status: "warning",
    title: "サムネイル最適化の機会",
    description: "サムネイルの視認性はクリック率に大きく影響します。",
    recommendation: "大きく読みやすいテキスト（3-5語）、人の顔、コントラストの高い色を使用することを推奨します。",
  });

  // 成長分析
  const subscribersPerVideo = channel.videoCount > 0 
    ? channel.subscriberCount / channel.videoCount 
    : 0;

  if (subscribersPerVideo >= 100) {
    insights.push({
      id: "growth-1",
      category: "growth",
      status: "good",
      title: "効率的な登録者獲得",
      description: `動画1本あたり平均${Math.round(subscribersPerVideo)}人の登録者を獲得しています。`,
    });
  } else if (subscribersPerVideo >= 30) {
    insights.push({
      id: "growth-1",
      category: "growth",
      status: "warning",
      title: "登録者獲得に改善の余地",
      description: `動画1本あたり${Math.round(subscribersPerVideo)}人の登録者を獲得しています。`,
      recommendation: "動画の冒頭と終わりに登録を促すCTAを追加しましょう。",
    });
  } else {
    insights.push({
      id: "growth-1",
      category: "growth",
      status: "critical",
      title: "登録者獲得率が低め",
      description: "視聴者を登録者に転換する施策が必要です。",
      recommendation: "チャンネル登録のメリットを明確にし、シリーズコンテンツで視聴者を引き付けましょう。",
    });
  }

  return insights;
}

function generateRecommendations(insights: AnalysisInsight[], metrics: PerformanceMetrics, keywordAnalysis: KeywordAnalysis): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 重要なインサイトに基づく推奨事項
  const criticalInsights = insights.filter((i) => i.status === "critical");
  const warningInsights = insights.filter((i) => i.status === "warning");

  if (criticalInsights.some((i) => i.category === "engagement")) {
    recommendations.push({
      id: "rec-engagement",
      priority: "high",
      category: "エンゲージメント改善",
      title: "視聴者との対話を強化",
      description: "エンゲージメント率を改善するための包括的な戦略が必要です。",
      actionItems: [
        "動画内で視聴者に質問を投げかける",
        "コメント欄で積極的に返信する",
        "コミュニティ投稿で視聴者アンケートを実施",
        "ライブ配信でリアルタイム交流を行う",
      ],
      expectedImpact: "エンゲージメント率20-50%向上",
    });
  }

  if (criticalInsights.some((i) => i.category === "frequency") || warningInsights.some((i) => i.category === "frequency")) {
    recommendations.push({
      id: "rec-frequency",
      priority: "high",
      category: "投稿頻度改善",
      title: "コンテンツカレンダーの作成",
      description: "定期的な投稿でチャンネルの成長を加速させましょう。",
      actionItems: [
        "月間の投稿スケジュールを事前に計画",
        "動画をバッチ制作して効率化",
        "ショート動画で投稿頻度を補完",
        "撮影・編集のテンプレート化",
      ],
      expectedImpact: "視聴者定着率15-30%向上",
    });
  }

  // キーワード分析に基づく推奨
  if (keywordAnalysis.topKeywords.length > 0) {
    const highPerformKeywords = keywordAnalysis.topKeywords.filter((k) => k.performance === "high");
    if (highPerformKeywords.length > 0) {
      recommendations.push({
        id: "rec-keywords",
        priority: "medium",
        category: "コンテンツ戦略",
        title: "高パフォーマンスキーワードの活用",
        description: `「${highPerformKeywords.slice(0, 3).map((k) => k.word).join("」「")}」などのキーワードが高い再生数を獲得しています。`,
        actionItems: [
          "これらのキーワードを含む新しい動画を企画",
          "関連するシリーズコンテンツを作成",
          "タイトルと説明文にキーワードを自然に含める",
        ],
        expectedImpact: "再生数10-25%向上の可能性",
      });
    }
  }

  // タイトルパターンに基づく推奨
  const effectivePatterns = keywordAnalysis.titlePatterns.filter((p) => p.effectiveness > 60);
  if (effectivePatterns.length > 0) {
    recommendations.push({
      id: "rec-titles",
      priority: "medium",
      category: "タイトル最適化",
      title: "効果的なタイトルパターンの活用",
      description: "分析結果から効果的なタイトルパターンが判明しています。",
      actionItems: effectivePatterns.map((p) => `${p.pattern}（効果: ${Math.round(p.effectiveness)}%）を活用`),
      expectedImpact: "クリック率5-15%向上",
    });
  }

  // サムネイル改善の推奨
  recommendations.push({
    id: "rec-thumbnail",
    priority: "medium",
    category: "サムネイル改善",
    title: "サムネイルのA/Bテスト",
    description: "サムネイルはクリック率に最も影響する要素の一つです。",
    actionItems: [
      "3-5語以内の大きく読みやすいテキスト",
      "人の顔や感情を表現する画像の使用",
      "ブランドカラーの一貫した使用",
      "複数のサムネイルを作成してテスト",
    ],
    expectedImpact: "クリック率10-30%向上",
  });

  return recommendations;
}

function calculateHealthScore(channel: ChannelInfo, videos: VideoInfo[], insights: AnalysisInsight[], metrics: PerformanceMetrics): number {
  let score = 50;
  const channelSize = getChannelSize(channel.subscriberCount);

  // エンゲージメント率に基づくスコア
  const avgEngagement = videos.length > 0
    ? videos.reduce((sum, v) => sum + parseFloat(v.engagementRate), 0) / videos.length
    : 0;
  
  const benchmark = BENCHMARKS.channelSize[channelSize];
  const engagementRatio = avgEngagement / benchmark.avgEngagement;
  
  if (engagementRatio >= 1.3) score += 15;
  else if (engagementRatio >= 1.0) score += 10;
  else if (engagementRatio >= 0.7) score += 5;
  else score -= 5;

  // エンゲージメントトレンドに基づくスコア
  if (metrics.engagementTrend === "up") score += 10;
  else if (metrics.engagementTrend === "down") score -= 5;

  // インサイトに基づくスコア調整
  insights.forEach((insight) => {
    if (insight.status === "good") score += 4;
    else if (insight.status === "warning") score += 0;
    else if (insight.status === "critical") score -= 4;
  });

  // 投稿頻度に基づくスコア
  if (videos.length >= 2) {
    const dates = videos.map((v) => new Date(v.publishedAt).getTime()).sort((a, b) => b - a);
    const daysBetween = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
    const avgDays = daysBetween / (videos.length - 1);
    
    if (avgDays <= 3) score += 10;
    else if (avgDays <= 7) score += 5;
    else if (avgDays > 21) score -= 5;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelInput } = body;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "サーバーにYouTube APIキーが設定されていません" },
        { status: 500 }
      );
    }

    if (!channelInput) {
      return NextResponse.json(
        { error: "チャンネルIDまたはハンドル名が必要です" },
        { status: 400 }
      );
    }

    let channelId = channelInput;

    // @で始まる場合はハンドル名として検索
    if (channelInput.startsWith("@")) {
      const foundId = await fetchChannelByHandle(channelInput, apiKey);
      if (!foundId) {
        return NextResponse.json(
          { error: "チャンネルが見つかりませんでした" },
          { status: 404 }
        );
      }
      channelId = foundId;
    }

    // URLからチャンネルIDを抽出
    if (channelInput.includes("youtube.com")) {
      const urlMatch = channelInput.match(/channel\/([a-zA-Z0-9_-]+)/);
      if (urlMatch) {
        channelId = urlMatch[1];
      } else {
        const handleMatch = channelInput.match(/@([a-zA-Z0-9_-]+)/);
        if (handleMatch) {
          const foundId = await fetchChannelByHandle("@" + handleMatch[1], apiKey);
          if (!foundId) {
            return NextResponse.json(
              { error: "チャンネルが見つかりませんでした" },
              { status: 404 }
            );
          }
          channelId = foundId;
        }
      }
    }

    // チャンネル情報を取得
    const channelInfo = await fetchChannelInfo(channelId, apiKey);
    if (!channelInfo) {
      return NextResponse.json(
        { error: "チャンネル情報の取得に失敗しました。APIキーまたはチャンネルIDを確認してください。" },
        { status: 404 }
      );
    }

    // 最近の動画を取得
    const recentVideos = await fetchRecentVideos(channelId, apiKey, 10);

    // パフォーマンスメトリクスを計算
    const performanceMetrics = calculatePerformanceMetrics(channelInfo, recentVideos);

    // キーワード分析
    const keywordAnalysis = analyzeKeywords(recentVideos);

    // インサイトを生成
    const insights = generateInsights(channelInfo, recentVideos, performanceMetrics);

    // 推奨事項を生成
    const recommendations = generateRecommendations(insights, performanceMetrics, keywordAnalysis);

    // ヘルススコアを計算
    const healthScore = calculateHealthScore(channelInfo, recentVideos, insights, performanceMetrics);

    // 平均エンゲージメント率を計算
    const avgEngagement = recentVideos.length > 0
      ? (recentVideos.reduce((sum, v) => sum + parseFloat(v.engagementRate), 0) / recentVideos.length).toFixed(2) + "%"
      : "N/A";

    // 投稿頻度を計算
    let uploadFrequency = "N/A";
    if (recentVideos.length >= 2) {
      const dates = recentVideos.map((v) => new Date(v.publishedAt).getTime()).sort((a, b) => b - a);
      const daysBetween = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
      const avgDays = daysBetween / (recentVideos.length - 1);
      if (avgDays < 1) uploadFrequency = "毎日以上";
      else if (avgDays < 7) uploadFrequency = `約${Math.round(avgDays)}日ごと`;
      else if (avgDays < 30) uploadFrequency = `約${Math.round(avgDays / 7)}週間ごと`;
      else uploadFrequency = `約${Math.round(avgDays / 30)}ヶ月ごと`;
    }

    const analysis: ChannelAnalysis = {
      channel: channelInfo,
      recentVideos,
      healthScore,
      averageEngagement: avgEngagement,
      uploadFrequency,
      insights,
      performanceMetrics,
      keywordAnalysis,
      recommendations,
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: "APIリクエスト中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
