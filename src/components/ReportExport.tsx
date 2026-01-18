"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChannelAnalysis } from "@/types/youtube";
import { formatNumber, formatDate } from "@/lib/utils";
import {
  Download,
  FileText,
  FileJson,
  Loader2,
  CheckCircle,
  Copy,
  Share2,
  Printer,
} from "lucide-react";

interface ReportExportProps {
  analysis: ChannelAnalysis;
}

export function ReportExport({ analysis }: ReportExportProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const exportAsJSON = () => {
    setIsExporting("json");
    try {
      const data = JSON.stringify(analysis, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysis.channel.title}_analysis_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess("json");
      setTimeout(() => setExportSuccess(null), 2000);
    } finally {
      setIsExporting(null);
    }
  };

  const exportAsMarkdown = () => {
    setIsExporting("md");
    try {
      const md = generateMarkdownReport(analysis);
      const blob = new Blob([md], { type: "text/markdown; charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysis.channel.title}_analysis_${new Date().toISOString().split("T")[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess("md");
      setTimeout(() => setExportSuccess(null), 2000);
    } finally {
      setIsExporting(null);
    }
  };

  const exportAsHTML = async () => {
    setIsExporting("html");
    try {
      const html = generateHTMLReport(analysis);
      const blob = new Blob([html], { type: "text/html; charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysis.channel.title}_analysis_${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess("html");
      setTimeout(() => setExportSuccess(null), 2000);
    } finally {
      setIsExporting(null);
    }
  };

  const printReport = () => {
    setIsExporting("print");
    try {
      const html = generateHTMLReport(analysis);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      setExportSuccess("print");
      setTimeout(() => setExportSuccess(null), 2000);
    } finally {
      setIsExporting(null);
    }
  };

  const copyToClipboard = async () => {
    setIsExporting("copy");
    try {
      const summary = generateTextSummary(analysis);
      await navigator.clipboard.writeText(summary);
      setExportSuccess("copy");
      setTimeout(() => setExportSuccess(null), 2000);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20">
            <Share2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg">レポートエクスポート</CardTitle>
            <CardDescription>分析結果を様々な形式で出力</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* 印刷/PDF */}
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-red-500/10 hover:border-red-500/50"
            onClick={printReport}
            disabled={isExporting !== null}
          >
            {isExporting === "print" ? (
              <Loader2 className="h-6 w-6 animate-spin text-red-400" />
            ) : exportSuccess === "print" ? (
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            ) : (
              <Printer className="h-6 w-6 text-red-400" />
            )}
            <span className="text-sm">印刷/PDF</span>
          </Button>

          {/* HTML出力 */}
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-orange-500/10 hover:border-orange-500/50"
            onClick={exportAsHTML}
            disabled={isExporting !== null}
          >
            {isExporting === "html" ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
            ) : exportSuccess === "html" ? (
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            ) : (
              <FileText className="h-6 w-6 text-orange-400" />
            )}
            <span className="text-sm">HTML</span>
          </Button>

          {/* Markdown出力 */}
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-violet-500/10 hover:border-violet-500/50"
            onClick={exportAsMarkdown}
            disabled={isExporting !== null}
          >
            {isExporting === "md" ? (
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            ) : exportSuccess === "md" ? (
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            ) : (
              <FileText className="h-6 w-6 text-violet-400" />
            )}
            <span className="text-sm">Markdown</span>
          </Button>

          {/* JSON出力 */}
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-amber-500/10 hover:border-amber-500/50"
            onClick={exportAsJSON}
            disabled={isExporting !== null}
          >
            {isExporting === "json" ? (
              <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            ) : exportSuccess === "json" ? (
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            ) : (
              <FileJson className="h-6 w-6 text-amber-400" />
            )}
            <span className="text-sm">JSON</span>
          </Button>

          {/* クリップボードにコピー */}
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-sky-500/10 hover:border-sky-500/50"
            onClick={copyToClipboard}
            disabled={isExporting !== null}
          >
            {isExporting === "copy" ? (
              <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            ) : exportSuccess === "copy" ? (
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            ) : (
              <Copy className="h-6 w-6 text-sky-400" />
            )}
            <span className="text-sm">コピー</span>
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          💡 ヒント: 「印刷/PDF」をクリックし、印刷ダイアログで「PDFとして保存」を選択するとPDFが作成できます。
        </p>
      </CardContent>
    </Card>
  );
}

function generateHTMLReport(analysis: ChannelAnalysis): string {
  const statusEmoji: Record<string, string> = { good: "✅", warning: "⚠️", critical: "❌" };
  const priorityLabel: Record<string, string> = { high: "🔴 高", medium: "🟡 中", low: "🔵 低" };
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${analysis.channel.title} - チャンネル分析レポート</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      padding: 40px;
      min-height: 100vh;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(251, 146, 60, 0.1));
      border-radius: 16px;
      border: 1px solid rgba(244, 63, 94, 0.2);
    }
    .header h1 { 
      font-size: 28px; 
      background: linear-gradient(90deg, #f43f5e, #fb923c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .header h2 { font-size: 22px; color: #fff; margin-bottom: 12px; }
    .header .date { color: #94a3b8; font-size: 14px; }
    .score-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      margin: 30px 0;
      padding: 30px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 16px;
      border: 1px solid #334155;
    }
    .score-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: conic-gradient(#f43f5e ${analysis.healthScore}%, #1e293b ${analysis.healthScore}%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .score-circle::before {
      content: '';
      width: 110px;
      height: 110px;
      background: #0f172a;
      border-radius: 50%;
      position: absolute;
    }
    .score-value {
      position: relative;
      z-index: 1;
      font-size: 36px;
      font-weight: bold;
      color: #f43f5e;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 20px 0;
    }
    .stat-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-card .label { color: #94a3b8; font-size: 13px; margin-bottom: 8px; }
    .stat-card .value { font-size: 24px; font-weight: bold; color: #fff; }
    .section { margin: 30px 0; }
    .section-title { 
      font-size: 18px; 
      color: #fff; 
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #334155;
    }
    .insight-item {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .insight-item.good { border-left: 4px solid #10b981; }
    .insight-item.warning { border-left: 4px solid #f59e0b; }
    .insight-item.critical { border-left: 4px solid #ef4444; }
    .insight-title { font-weight: 600; color: #fff; margin-bottom: 6px; }
    .insight-desc { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    .insight-rec { 
      margin-top: 10px; 
      padding: 10px; 
      background: rgba(251, 191, 36, 0.1);
      border-radius: 8px;
      font-size: 13px;
      color: #fbbf24;
    }
    .video-list { list-style: none; }
    .video-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid #334155;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .video-item .rank {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #f43f5e, #fb923c);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: #fff;
      flex-shrink: 0;
    }
    .video-item .info { flex: 1; }
    .video-item .title { font-weight: 500; color: #fff; margin-bottom: 4px; }
    .video-item .stats { color: #94a3b8; font-size: 13px; }
    .recommendation {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .recommendation.high { border-left: 4px solid #ef4444; }
    .recommendation.medium { border-left: 4px solid #f59e0b; }
    .recommendation.low { border-left: 4px solid #3b82f6; }
    .recommendation .priority { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
    .recommendation .title { font-weight: 600; color: #fff; margin-bottom: 8px; }
    .recommendation .desc { color: #94a3b8; font-size: 14px; margin-bottom: 12px; }
    .recommendation ul { margin-left: 20px; color: #cbd5e1; font-size: 14px; }
    .recommendation li { margin-bottom: 6px; }
    .recommendation .impact { 
      margin-top: 12px; 
      padding: 8px 12px; 
      background: rgba(99, 102, 241, 0.1);
      border-radius: 6px;
      font-size: 13px;
      color: #a5b4fc;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #334155;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body { background: #fff; color: #1e293b; padding: 20px; }
      .header { background: #f8fafc; border-color: #e2e8f0; }
      .header h1 { -webkit-text-fill-color: #f43f5e; }
      .score-section, .stat-card, .insight-item, .video-item, .recommendation { 
        background: #f8fafc; 
        border-color: #e2e8f0;
        color: #1e293b;
      }
      .stat-card .value, .insight-title, .video-item .title, .recommendation .title { color: #1e293b; }
      .insight-desc, .video-item .stats, .recommendation .desc { color: #64748b; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 YouTube Channel Analysis Report</h1>
      <h2>${analysis.channel.title}</h2>
      <p class="date">作成日: ${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>

    <div class="score-section">
      <div class="score-circle">
        <span class="score-value">${analysis.healthScore}</span>
      </div>
      <div>
        <h3 style="color: #fff; margin-bottom: 8px;">チャンネルヘルススコア</h3>
        <p style="color: #94a3b8; font-size: 14px;">
          ${analysis.healthScore >= 80 ? "🌟 優秀 - 素晴らしいパフォーマンスです！" :
            analysis.healthScore >= 60 ? "👍 良好 - 順調に成長しています" :
            analysis.healthScore >= 40 ? "📊 標準的 - 改善の余地があります" :
            "⚠️ 要改善 - 戦略の見直しを推奨"}
        </p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">登録者数</div>
        <div class="value">${formatNumber(analysis.channel.subscriberCount)}</div>
      </div>
      <div class="stat-card">
        <div class="label">総再生数</div>
        <div class="value">${formatNumber(analysis.channel.viewCount)}</div>
      </div>
      <div class="stat-card">
        <div class="label">動画数</div>
        <div class="value">${formatNumber(analysis.channel.videoCount)}</div>
      </div>
      <div class="stat-card">
        <div class="label">平均エンゲージメント</div>
        <div class="value">${analysis.averageEngagement}</div>
      </div>
      <div class="stat-card">
        <div class="label">投稿頻度</div>
        <div class="value">${analysis.uploadFrequency}</div>
      </div>
      <div class="stat-card">
        <div class="label">動画あたり再生数</div>
        <div class="value">${formatNumber(Math.round(analysis.channel.viewCount / analysis.channel.videoCount))}</div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">💡 分析インサイト</h3>
      ${analysis.insights.map(insight => `
        <div class="insight-item ${insight.status}">
          <div class="insight-title">${statusEmoji[insight.status]} ${insight.title}</div>
          <div class="insight-desc">${insight.description}</div>
          ${insight.recommendation ? `<div class="insight-rec">💡 ${insight.recommendation}</div>` : ""}
        </div>
      `).join("")}
    </div>

    <div class="section">
      <h3 class="section-title">🚀 アクションプラン</h3>
      ${analysis.recommendations.map(rec => `
        <div class="recommendation ${rec.priority}">
          <div class="priority">${priorityLabel[rec.priority]} | ${rec.category}</div>
          <div class="title">${rec.title}</div>
          <div class="desc">${rec.description}</div>
          <ul>
            ${rec.actionItems.map(item => `<li>${item}</li>`).join("")}
          </ul>
          <div class="impact">📈 期待効果: ${rec.expectedImpact}</div>
        </div>
      `).join("")}
    </div>

    <div class="section">
      <h3 class="section-title">📹 直近の動画 (Top 5)</h3>
      <ul class="video-list">
        ${analysis.recentVideos.slice(0, 5).map((video, index) => `
          <li class="video-item">
            <span class="rank">${index + 1}</span>
            <div class="info">
              <div class="title">${video.title}</div>
              <div class="stats">
                👁 ${formatNumber(video.viewCount)} 再生 | 
                👍 ${formatNumber(video.likeCount)} いいね | 
                💬 ${formatNumber(video.commentCount)} コメント | 
                📊 ${video.engagementRate} エンゲージメント
              </div>
            </div>
          </li>
        `).join("")}
      </ul>
    </div>

    <div class="footer">
      <p>Generated by YouTube Channel Analyzer</p>
      <p>このレポートはYouTube Data API v3から取得したデータに基づいています</p>
    </div>
  </div>
</body>
</html>`;
}

function generateMarkdownReport(analysis: ChannelAnalysis): string {
  const lines: string[] = [];
  
  lines.push(`# YouTube Channel Analysis Report`);
  lines.push(`## ${analysis.channel.title}`);
  lines.push(``);
  lines.push(`**作成日:** ${new Date().toLocaleDateString("ja-JP")}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 📊 概要`);
  lines.push(``);
  lines.push(`| 指標 | 値 |`);
  lines.push(`|------|-----|`);
  lines.push(`| ヘルススコア | ${analysis.healthScore}/100 |`);
  lines.push(`| 登録者数 | ${formatNumber(analysis.channel.subscriberCount)} |`);
  lines.push(`| 総再生数 | ${formatNumber(analysis.channel.viewCount)} |`);
  lines.push(`| 動画数 | ${formatNumber(analysis.channel.videoCount)} |`);
  lines.push(`| 平均エンゲージメント | ${analysis.averageEngagement} |`);
  lines.push(`| 投稿頻度 | ${analysis.uploadFrequency} |`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 💡 分析インサイト`);
  lines.push(``);

  const statusEmoji: Record<string, string> = { good: "✅", warning: "⚠️", critical: "❌" };
  analysis.insights.forEach((insight) => {
    lines.push(`### ${statusEmoji[insight.status]} ${insight.title}`);
    lines.push(``);
    lines.push(insight.description);
    if (insight.recommendation) {
      lines.push(``);
      lines.push(`> 💡 **推奨:** ${insight.recommendation}`);
    }
    lines.push(``);
  });

  lines.push(`---`);
  lines.push(``);
  lines.push(`## 🚀 アクションプラン`);
  lines.push(``);

  analysis.recommendations.forEach((rec) => {
    const priorityEmoji: Record<string, string> = { high: "🔴", medium: "🟡", low: "🔵" };
    lines.push(`### ${priorityEmoji[rec.priority]} ${rec.title}`);
    lines.push(``);
    lines.push(rec.description);
    lines.push(``);
    lines.push(`**アクションアイテム:**`);
    rec.actionItems.forEach((item) => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push(``);
    lines.push(`**期待効果:** ${rec.expectedImpact}`);
    lines.push(``);
  });

  lines.push(`---`);
  lines.push(``);
  lines.push(`## 📹 直近の動画`);
  lines.push(``);
  lines.push(`| タイトル | 再生数 | エンゲージメント |`);
  lines.push(`|----------|--------|-----------------|`);
  analysis.recentVideos.slice(0, 5).forEach((video) => {
    const title = video.title.length > 30 ? video.title.substring(0, 30) + "..." : video.title;
    lines.push(`| ${title} | ${formatNumber(video.viewCount)} | ${video.engagementRate} |`);
  });
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`*Generated by YouTube Channel Analyzer*`);

  return lines.join("\n");
}

function generateTextSummary(analysis: ChannelAnalysis): string {
  const lines: string[] = [];
  
  lines.push(`📊 YouTube チャンネル分析: ${analysis.channel.title}`);
  lines.push(``);
  lines.push(`ヘルススコア: ${analysis.healthScore}/100`);
  lines.push(`登録者数: ${formatNumber(analysis.channel.subscriberCount)}`);
  lines.push(`総再生数: ${formatNumber(analysis.channel.viewCount)}`);
  lines.push(`動画数: ${analysis.channel.videoCount}`);
  lines.push(`平均エンゲージメント: ${analysis.averageEngagement}`);
  lines.push(``);
  lines.push(`主要インサイト:`);
  
  analysis.insights.slice(0, 5).forEach((insight) => {
    const emoji = insight.status === "good" ? "✅" : insight.status === "warning" ? "⚠️" : "❌";
    lines.push(`${emoji} ${insight.title}`);
  });

  return lines.join("\n");
}
