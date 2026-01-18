export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt: string;
  country?: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  engagementRate: string;
  tags?: string[];
}

export interface ChannelAnalysis {
  channel: ChannelInfo;
  recentVideos: VideoInfo[];
  healthScore: number;
  averageEngagement: string;
  uploadFrequency: string;
  insights: AnalysisInsight[];
  performanceMetrics: PerformanceMetrics;
  keywordAnalysis: KeywordAnalysis;
  recommendations: Recommendation[];
}

export interface PerformanceMetrics {
  viewsPerVideo: number;
  subscribersPerVideo: number;
  engagementTrend: "up" | "down" | "stable";
  topPerformingVideo: VideoInfo | null;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  viewsGrowthRate: number;
}

export interface KeywordAnalysis {
  topKeywords: KeywordItem[];
  titlePatterns: TitlePattern[];
  hashtagUsage: HashtagItem[];
}

export interface KeywordItem {
  word: string;
  count: number;
  avgViews: number;
  performance: "high" | "medium" | "low";
}

export interface TitlePattern {
  pattern: string;
  description: string;
  count: number;
  effectiveness: number;
}

export interface HashtagItem {
  tag: string;
  count: number;
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
}

export interface AnalysisInsight {
  id: string;
  category: "title" | "thumbnail" | "engagement" | "frequency" | "growth" | "seo" | "content";
  status: "good" | "warning" | "critical";
  title: string;
  description: string;
  recommendation?: string;
  metric?: {
    current: number;
    benchmark: number;
    unit: string;
  };
}

export interface CompetitorData {
  channel: ChannelInfo;
  recentVideos: VideoInfo[];
  comparisonMetrics: {
    subscriberRatio: number;
    viewRatio: number;
    engagementRatio: number;
    uploadFrequencyRatio: number;
  };
}

export interface YouTubeAPIError {
  code: number;
  message: string;
}

// エンゲージメント率のベンチマーク（業界標準）
export const ENGAGEMENT_BENCHMARKS = {
  excellent: 6.0,    // 6%以上：非常に優秀
  good: 3.5,         // 3.5%以上：良好
  average: 2.0,      // 2%以上：標準
  belowAverage: 1.0, // 1%以上：やや低め
  poor: 0.5,         // 0.5%未満：要改善
} as const;

// チャンネル規模別のベンチマーク
export const CHANNEL_SIZE_BENCHMARKS = {
  micro: { min: 0, max: 10000, avgEngagement: 8.0 },
  small: { min: 10000, max: 100000, avgEngagement: 4.5 },
  medium: { min: 100000, max: 1000000, avgEngagement: 3.0 },
  large: { min: 1000000, max: 10000000, avgEngagement: 2.0 },
  mega: { min: 10000000, max: Infinity, avgEngagement: 1.5 },
} as const;

export type ChannelSize = keyof typeof CHANNEL_SIZE_BENCHMARKS;

export function getChannelSize(subscriberCount: number): ChannelSize {
  if (subscriberCount < 10000) return "micro";
  if (subscriberCount < 100000) return "small";
  if (subscriberCount < 1000000) return "medium";
  if (subscriberCount < 10000000) return "large";
  return "mega";
}
