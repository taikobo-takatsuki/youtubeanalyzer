"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface HealthScoreGaugeProps {
  score: number;
}

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500", label: "優秀" };
    if (score >= 60) return { text: "text-sky-400", bg: "bg-sky-500", label: "良好" };
    if (score >= 40) return { text: "text-amber-400", bg: "bg-amber-500", label: "普通" };
    return { text: "text-red-400", bg: "bg-red-500", label: "改善が必要" };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-2">
          <Activity className={cn("h-5 w-5", colors.text)} />
          <CardTitle className="text-lg">チャンネルヘルススコア</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative flex flex-col items-center py-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* 背景の円 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
            />
            {/* スコアを示す円 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
          {/* 中央のスコア表示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", colors.text)}>{score}</span>
            <span className="text-sm text-slate-400">/100</span>
          </div>
        </div>
        <div className={cn("mt-4 px-4 py-2 rounded-full text-sm font-medium", colors.bg + "/20", colors.text)}>
          {colors.label}
        </div>
      </CardContent>
    </Card>
  );
}
