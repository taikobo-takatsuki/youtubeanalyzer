"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Youtube, Loader2 } from "lucide-react";

interface ChannelSearchProps {
  onSearch: (channelInput: string) => void;
  isLoading: boolean;
}

export function ChannelSearch({ onSearch, isLoading }: ChannelSearchProps) {
  const [channelInput, setChannelInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelInput.trim()) {
      onSearch(channelInput.trim());
    }
  };

  const placeholderExamples = [
    "@channelname",
    "UCxxxxxxxxxxxxxxxx",
    "https://youtube.com/@channelname",
  ];

  return (
    <Card className="overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-orange-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25">
            <Youtube className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">チャンネル分析</CardTitle>
            <CardDescription>
              分析したいYouTubeチャンネルを入力してください
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="チャンネルID、ハンドル名、またはURL"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                className="pl-11"
              />
            </div>
            <Button
              type="submit"
            disabled={!channelInput.trim() || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  分析開始
                </>
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500">入力例:</span>
            {placeholderExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setChannelInput(example)}
                className="text-xs px-2 py-1 rounded-md bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
