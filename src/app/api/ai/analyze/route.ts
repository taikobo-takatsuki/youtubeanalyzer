import { NextRequest, NextResponse } from "next/server";
import type { 
  ThumbnailAnalysis, 
  TitleSEOAnalysis, 
  DescriptionAnalysis, 
  VideoThemeSuggestion 
} from "@/types/ai";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function callOpenAI(
  apiKey: string, 
  messages: { role: string; content: string | { type: string; text?: string; image_url?: { url: string } }[] }[],
  model: string = "gpt-4o-mini"
) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function analyzeThumbnail(imageUrl: string, apiKey: string): Promise<ThumbnailAnalysis> {
  const prompt = `あなたはYouTubeサムネイルの専門アナリストです。以下のサムネイル画像を分析し、以下の観点から評価してください。

各項目を0-100のスコアで評価し、日本語で詳細なフィードバックを提供してください。

1. テキストの視認性（読みやすさ、フォントサイズ、コントラスト）
2. 構図（視線誘導、焦点、バランス）
3. 色彩（カラースキーム、コントラスト、目を引く色使い）
4. 感情的インパクト（表情、感情を誘発する要素）
5. クリック誘発要因（好奇心、緊急性、価値提案）

JSON形式で以下の構造で回答してください：
{
  "overallScore": 数値,
  "textVisibility": {
    "score": 数値,
    "feedback": "フィードバック",
    "suggestions": ["改善案1", "改善案2"]
  },
  "composition": {
    "score": 数値,
    "feedback": "フィードバック",
    "suggestions": ["改善案1", "改善案2"]
  },
  "colorScheme": {
    "score": 数値,
    "feedback": "フィードバック",
    "dominantColors": ["色1", "色2"],
    "suggestions": ["改善案1", "改善案2"]
  },
  "emotionalImpact": {
    "score": 数値,
    "feedback": "フィードバック",
    "detectedEmotions": ["感情1", "感情2"]
  },
  "clickabilityFactors": ["要因1", "要因2"],
  "improvements": ["総合的な改善案1", "改善案2", "改善案3"]
}`;

  const response = await callOpenAI(
    apiKey,
    [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    "gpt-4o"
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch {
    throw new Error("Failed to parse thumbnail analysis");
  }
}

async function analyzeTitleSEO(title: string, channelNiche: string, apiKey: string): Promise<TitleSEOAnalysis> {
  const prompt = `あなたはYouTube SEOの専門家です。以下の動画タイトルを分析してください。

タイトル: "${title}"
チャンネルジャンル: ${channelNiche}

以下の観点から0-100のスコアで評価し、日本語で詳細なフィードバックを提供してください：

1. キーワード最適化（検索されやすいキーワードの使用）
2. クリックトリガー（好奇心、数字、感情的な言葉）
3. 長さの分析（最適な文字数か）
4. 感情的アピール（視聴者の感情に訴えかけるか）

JSON形式で回答してください：
{
  "overallScore": 数値,
  "keywordOptimization": {
    "score": 数値,
    "detectedKeywords": ["キーワード1", "キーワード2"],
    "missingKeywords": ["推奨キーワード1", "推奨キーワード2"],
    "feedback": "フィードバック"
  },
  "clickTriggers": {
    "score": 数値,
    "detected": ["検出されたトリガー1", "トリガー2"],
    "suggestions": ["追加すべきトリガー1", "トリガー2"]
  },
  "lengthAnalysis": {
    "score": 数値,
    "currentLength": 文字数,
    "optimalRange": "40-60文字",
    "feedback": "フィードバック"
  },
  "emotionalAppeal": {
    "score": 数値,
    "feedback": "フィードバック"
  },
  "improvements": ["改善されたタイトル案1", "タイトル案2", "タイトル案3"]
}`;

  const response = await callOpenAI(apiKey, [{ role: "user", content: prompt }]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch {
    throw new Error("Failed to parse title SEO analysis");
  }
}

async function analyzeDescription(description: string, title: string, apiKey: string): Promise<DescriptionAnalysis> {
  const prompt = `あなたはYouTube動画の説明文最適化の専門家です。以下の説明文を分析してください。

動画タイトル: "${title}"
説明文: """
${description.substring(0, 2000)}
"""

以下の観点から0-100のスコアで評価し、日本語でフィードバックを提供してください：

1. SEO最適化（キーワード、検索性）
2. CTA分析（行動喚起、登録促進など）
3. 構造（タイムスタンプ、リンク、ハッシュタグ）

そして、改善された説明文の例を提供してください。

JSON形式で回答してください：
{
  "overallScore": 数値,
  "seoOptimization": {
    "score": 数値,
    "keywordsFound": ["キーワード1", "キーワード2"],
    "suggestions": ["SEO改善案1", "改善案2"]
  },
  "ctaAnalysis": {
    "score": 数値,
    "detectedCTAs": ["検出されたCTA1", "CTA2"],
    "missingSuggestions": ["追加すべきCTA1", "CTA2"]
  },
  "structure": {
    "score": 数値,
    "hasTimestamps": boolean,
    "hasLinks": boolean,
    "hasHashtags": boolean,
    "suggestions": ["構造改善案1", "改善案2"]
  },
  "improvedDescription": "改善された説明文の例（500文字程度）"
}`;

  const response = await callOpenAI(apiKey, [{ role: "user", content: prompt }]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch {
    throw new Error("Failed to parse description analysis");
  }
}

async function suggestVideoThemes(
  channelTitle: string,
  recentTitles: string[],
  topKeywords: string[],
  avgViews: number,
  apiKey: string
): Promise<VideoThemeSuggestion[]> {
  const prompt = `あなたはYouTubeコンテンツ戦略の専門家です。以下のチャンネル情報に基づいて、次に作成すべき動画のテーマを5つ提案してください。

チャンネル名: ${channelTitle}
最近の動画タイトル:
${recentTitles.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join("\n")}

よく使われるキーワード: ${topKeywords.join(", ")}
平均再生数: ${avgViews.toLocaleString()}回

以下の観点を考慮してください：
- チャンネルの方向性との一貫性
- 視聴者のニーズとトレンド
- エンゲージメントを高める要素
- 検索されやすいテーマ

JSON形式で5つの提案を返してください：
[
  {
    "id": "1",
    "title": "提案するタイトル",
    "description": "この動画の概要と狙い",
    "expectedPerformance": "high" | "medium" | "low",
    "reasoning": "なぜこのテーマを提案するか",
    "keyPoints": ["動画で扱うべきポイント1", "ポイント2", "ポイント3"],
    "suggestedTags": ["タグ1", "タグ2", "タグ3"],
    "trendRelevance": 0-100の数値
  }
]`;

  const response = await callOpenAI(apiKey, [{ role: "user", content: prompt }]);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch {
    throw new Error("Failed to parse video theme suggestions");
  }
}

async function analyzeCompetitors(
  channelTitle: string,
  channelDescription: string,
  recentTitles: string[],
  apiKey: string
): Promise<{ strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }> {
  const prompt = `あなたはYouTubeマーケティングの専門家です。以下のチャンネル情報に基づいて、SWOT分析を行ってください。

チャンネル名: ${channelTitle}
チャンネル説明: ${channelDescription.substring(0, 500)}
最近の動画タイトル:
${recentTitles.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join("\n")}

一般的なYouTube市場のトレンドと比較して、このチャンネルのSWOT分析を行ってください。

JSON形式で回答してください：
{
  "strengths": ["強み1", "強み2", "強み3"],
  "weaknesses": ["弱み1", "弱み2", "弱み3"],
  "opportunities": ["機会1", "機会2", "機会3"],
  "threats": ["脅威1", "脅威2", "脅威3"]
}`;

  const response = await callOpenAI(apiKey, [{ role: "user", content: prompt }]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch {
    throw new Error("Failed to parse SWOT analysis");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      thumbnailUrl, 
      title, 
      description, 
      channelTitle,
      channelDescription,
      channelNiche,
      recentTitles,
      topKeywords,
      avgViews 
    } = body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "サーバーにOpenAI APIキーが設定されていません" },
        { status: 500 }
      );
    }

    let result;

    switch (type) {
      case "thumbnail":
        if (!thumbnailUrl) {
          return NextResponse.json({ error: "サムネイルURLが必要です" }, { status: 400 });
        }
        result = await analyzeThumbnail(thumbnailUrl, apiKey);
        break;

      case "title":
        if (!title) {
          return NextResponse.json({ error: "タイトルが必要です" }, { status: 400 });
        }
        result = await analyzeTitleSEO(title, channelNiche || "一般", apiKey);
        break;

      case "description":
        if (!description || !title) {
          return NextResponse.json({ error: "説明文とタイトルが必要です" }, { status: 400 });
        }
        result = await analyzeDescription(description, title, apiKey);
        break;

      case "themes":
        if (!channelTitle || !recentTitles) {
          return NextResponse.json({ error: "チャンネル情報が必要です" }, { status: 400 });
        }
        result = await suggestVideoThemes(
          channelTitle,
          recentTitles,
          topKeywords || [],
          avgViews || 0,
          apiKey
        );
        break;

      case "swot":
        if (!channelTitle) {
          return NextResponse.json({ error: "チャンネル情報が必要です" }, { status: 400 });
        }
        result = await analyzeCompetitors(
          channelTitle,
          channelDescription || "",
          recentTitles || [],
          apiKey
        );
        break;

      default:
        return NextResponse.json({ error: "無効な分析タイプです" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
