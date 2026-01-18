import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "YouTube チャンネル分析 | Channel Analyzer",
  description: "YouTubeチャンネルの統計データを分析し、改善のためのインサイトを提供します。",
  keywords: ["YouTube", "分析", "チャンネル", "統計", "マーケティング"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="relative min-h-screen">
          {/* 背景効果 */}
          <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
          <div className="fixed inset-0 gradient-overlay pointer-events-none" />
          
          {/* メインコンテンツ */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
