"use client";

import { ChannelInfo } from "@/types/youtube";
import { formatNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ChannelHeaderProps {
  channel: ChannelInfo;
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
      {/* バナー画像（存在する場合） */}
      {channel.bannerUrl && (
        <div className="relative h-32 md:h-48 w-full">
          <Image
            src={channel.bannerUrl}
            alt={`${channel.title} banner`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
      )}

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* チャンネルアイコン */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl">
              <Image
                src={channel.thumbnailUrl}
                alt={channel.title}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 shadow-lg">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>

          {/* チャンネル情報 */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {channel.title}
              </h1>
              <a
                href={`https://youtube.com/${channel.customUrl || `channel/${channel.id}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            </div>

            {channel.customUrl && (
              <p className="text-slate-400">{channel.customUrl}</p>
            )}

            <div className="flex flex-wrap gap-3">
              {channel.country && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {channel.country}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                開設: {formatDate(channel.publishedAt)}
              </Badge>
            </div>

            {channel.description && (
              <p className="text-sm text-slate-400 line-clamp-2 max-w-2xl">
                {channel.description}
              </p>
            )}
          </div>

          {/* クイック統計 */}
          <div className="flex gap-6 md:gap-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatNumber(channel.subscriberCount)}
              </p>
              <p className="text-xs text-slate-400">登録者</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatNumber(channel.viewCount)}
              </p>
              <p className="text-xs text-slate-400">総再生数</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatNumber(channel.videoCount)}
              </p>
              <p className="text-xs text-slate-400">動画数</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
