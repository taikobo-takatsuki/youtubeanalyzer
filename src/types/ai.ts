export interface ThumbnailAnalysis {
  overallScore: number;
  textVisibility: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  composition: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  colorScheme: {
    score: number;
    feedback: string;
    dominantColors: string[];
    suggestions: string[];
  };
  emotionalImpact: {
    score: number;
    feedback: string;
    detectedEmotions: string[];
  };
  clickabilityFactors: string[];
  improvements: string[];
}

export interface TitleSEOAnalysis {
  overallScore: number;
  keywordOptimization: {
    score: number;
    detectedKeywords: string[];
    missingKeywords: string[];
    feedback: string;
  };
  clickTriggers: {
    score: number;
    detected: string[];
    suggestions: string[];
  };
  lengthAnalysis: {
    score: number;
    currentLength: number;
    optimalRange: string;
    feedback: string;
  };
  emotionalAppeal: {
    score: number;
    feedback: string;
  };
  improvements: string[];
}

export interface DescriptionAnalysis {
  overallScore: number;
  seoOptimization: {
    score: number;
    keywordsFound: string[];
    suggestions: string[];
  };
  ctaAnalysis: {
    score: number;
    detectedCTAs: string[];
    missingSuggestions: string[];
  };
  structure: {
    score: number;
    hasTimestamps: boolean;
    hasLinks: boolean;
    hasHashtags: boolean;
    suggestions: string[];
  };
  improvedDescription: string;
}

export interface VideoThemeSuggestion {
  id: string;
  title: string;
  description: string;
  expectedPerformance: "high" | "medium" | "low";
  reasoning: string;
  keyPoints: string[];
  suggestedTags: string[];
  trendRelevance: number;
}

export interface AIAnalysisResult {
  thumbnailAnalysis?: ThumbnailAnalysis;
  titleSEOAnalysis?: TitleSEOAnalysis;
  descriptionAnalysis?: DescriptionAnalysis;
  videoThemeSuggestions?: VideoThemeSuggestion[];
  channelPositioning?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitorInsights?: string[];
}
