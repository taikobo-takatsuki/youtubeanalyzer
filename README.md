# YouTube Channel Analyzer v0.2.0

YouTubeチャンネルの統計データを分析し、改善のためのインサイトを提供するWebアプリケーションです。

![YouTube Analyzer](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ 機能

### 📊 概要ダッシュボード
- **チャンネル統計**: 登録者数、総再生数、動画本数を一目で確認
- **動画リスト**: 直近の動画10本のサムネイル、タイトル、再生数、投稿日を表示
- **エンゲージメント率**: (いいね数 + コメント数) / 再生数 で計算
- **ヘルススコア**: チャンネル規模に応じたベンチマークで100点満点評価

### 📈 パフォーマンス分析
- **再生数推移グラフ**: 動画ごとの再生数とエンゲージメント率の可視化
- **エンゲージメント詳細**: いいね・コメント数の動画別比較チャート
- **トレンド分析**: 直近の動画と過去の動画のパフォーマンス比較

### 🔍 キーワード分析
- **頻出キーワード**: タイトルで使用されているキーワードとその効果
- **タイトルパターン**: 数字・疑問形・括弧など効果的なパターンの分析
- **ハッシュタグ**: 説明文で使用されているタグの一覧

### 💡 インサイト & アクションプラン
- **改善インサイト**: エンゲージメント、タイトル、投稿頻度、SEOなどの詳細分析
- **チャンネル規模別ベンチマーク**: 同規模チャンネルとの比較評価
- **具体的アクションプラン**: 優先度付きの改善施策とチェックリスト

### ⚔️ 競合チャンネル比較
- 複数の競合チャンネルを追加して比較
- 登録者数・再生数・動画数の差分分析
- ベンチマーク比較表

### 📤 レポートエクスポート
- **PDF出力**: 分析結果をPDFレポートとして保存
- **Markdown**: 詳細なMarkdown形式レポート
- **JSON**: 生データのJSON出力
- **クリップボード**: サマリーをコピー

## 🚀 セットアップ

### 1. 依存パッケージのインストール

```bash
cd youtube-analyzer
npm install
```

### 2. 環境変数の設定（安全な方法）

`.env.local` を作成して、サーバー側にAPIキーを保存します（ブラウザには送信されません）。

```bash
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
ALLOWED_ORIGINS=https://your-site.netlify.app,https://your-custom-domain.com
RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW_MS=600000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### 4. YouTube Data API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新規プロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から「YouTube Data API v3」を有効化
4. 「APIとサービス」→「認証情報」でAPIキーを作成
5. `.env.local` に `YOUTUBE_API_KEY` として保存

## 📖 使い方

1. **チャンネルを検索**: 以下のいずれかの形式で入力
   - ハンドル名: `@channelname`
   - チャンネルID: `UCxxxxxxxxxxxxxxxx`
   - URL: `https://youtube.com/@channelname`
2. **タブを切り替えて分析**:
   - 概要 → パフォーマンス → キーワード分析 → アクションプラン → 競合比較

## 🛠 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **PDF**: jsPDF
- **Icons**: Lucide React
- **API**: YouTube Data API v3

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── api/
│   │   └── youtube/
│   │       └── channel/
│   │           └── route.ts          # YouTube API連携・分析ロジック
│   ├── globals.css                   # グローバルスタイル
│   ├── layout.tsx                    # ルートレイアウト
│   └── page.tsx                      # メインページ（タブUI）
├── components/
│   ├── AIAnalysisPanel.tsx           # AI分析パネル
│   ├── ChannelHeader.tsx             # チャンネル情報ヘッダー
│   ├── ChannelSearch.tsx             # チャンネル検索フォーム
│   ├── CompetitorComparison.tsx      # 競合チャンネル比較
│   ├── HealthScoreGauge.tsx          # ヘルススコアゲージ
│   ├── InsightsPanel.tsx             # 分析インサイトパネル
│   ├── KeywordAnalysisPanel.tsx      # キーワード分析
│   ├── PerformanceCharts.tsx         # パフォーマンスグラフ
│   ├── RecommendationsPanel.tsx      # アクションプラン
│   ├── ReportExport.tsx              # レポートエクスポート
│   ├── StatCard.tsx                  # 統計カード
│   └── VideoList.tsx                 # 動画リスト
├── lib/
│   └── utils.ts                      # ユーティリティ関数
└── types/
    ├── ai.ts                         # AI関連型定義
    └── youtube.ts                    # 型定義・ベンチマーク定数
```

## 🎯 エンゲージメント率のベンチマーク

| チャンネル規模 | 登録者数 | 平均エンゲージメント率 |
|---------------|---------|---------------------|
| マイクロ | 〜1万 | 8.0% |
| スモール | 1万〜10万 | 4.5% |
| ミディアム | 10万〜100万 | 3.0% |
| ラージ | 100万〜1000万 | 2.0% |
| メガ | 1000万〜 | 1.5% |

## ⚠️ 注意事項

- YouTube Data API には1日あたりのクォータ制限があります（通常10,000ユニット/日）
  - チャンネル検索: 100ユニット
  - 動画リスト取得: 1ユニット
- APIキーはサーバー側の環境変数で管理され、ブラウザには送信されません
- 競合比較機能を使用するとAPIクォータを追加消費します

## 📄 ライセンス

MIT License
