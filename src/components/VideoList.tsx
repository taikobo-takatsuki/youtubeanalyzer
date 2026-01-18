"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";
import { VideoInfo } from "@/types/youtube";
import { Play, ThumbsUp, MessageCircle, Eye, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";

interface VideoListProps {
  videos: VideoInfo[];
}

export function VideoList({ videos }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-400">動画が見つかりませんでした</p>
        </CardContent>
      </Card>
    );
  }

  const getEngagementBadgeVariant = (rate: string): "success" | "warning" | "danger" => {
    const numRate = parseFloat(rate);
    if (numRate >= 5) return "success";
    if (numRate >= 2) return "warning";
    return "danger";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-rose-400" />
          <CardTitle>最近の動画 ({videos.length}本)</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="group relative flex gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-200 border border-slate-800 hover:border-slate-700"
          >
            {/* ランキング番号 */}
            <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {index + 1}
            </div>

            {/* サムネイル */}
            <div className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-slate-900">
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <a
                href={`https://youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-6 w-6 text-white" />
              </a>
            </div>

            {/* 動画情報 */}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-medium text-white line-clamp-2 group-hover:text-rose-300 transition-colors">
                {video.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(video.viewCount)}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {formatNumber(video.likeCount)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {formatNumber(video.commentCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(video.publishedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getEngagementBadgeVariant(video.engagementRate)}>
                  エンゲージメント率: {video.engagementRate}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
