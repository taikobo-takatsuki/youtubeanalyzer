"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Recommendation } from "@/types/youtube";
import {
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  Circle,
  Rocket,
  Target,
  Zap,
  ArrowRight,
} from "lucide-react";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(
    recommendations.find((r) => r.priority === "high")?.id || null
  );

  const toggleComplete = (recId: string, itemIndex: number) => {
    const key = `${recId}-${itemIndex}`;
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const priorityConfig = {
    high: {
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      gradient: "from-red-500/20 to-rose-500/20",
      label: "優先度: 高",
      icon: Zap,
    },
    medium: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      gradient: "from-amber-500/20 to-yellow-500/20",
      label: "優先度: 中",
      icon: Target,
    },
    low: {
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      gradient: "from-sky-500/20 to-cyan-500/20",
      label: "優先度: 低",
      icon: Lightbulb,
    },
  };

  // 優先度順にソート
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-lg shadow-amber-500/10">
            <Rocket className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg">アクションプラン</CardTitle>
            <CardDescription>チャンネル改善のための具体的な施策</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedRecommendations.map((rec) => {
          const config = priorityConfig[rec.priority];
          const PriorityIcon = config.icon;
          const isExpanded = expandedId === rec.id;
          const completedCount = rec.actionItems.filter(
            (_, i) => completedItems.has(`${rec.id}-${i}`)
          ).length;
          const progress = (completedCount / rec.actionItems.length) * 100;

          return (
            <div
              key={rec.id}
              className={cn(
                "rounded-xl border overflow-hidden transition-all duration-300",
                config.border,
                isExpanded ? "shadow-lg" : "hover:shadow-md"
              )}
            >
              {/* ヘッダー */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                className={cn(
                  "w-full text-left p-4 transition-colors",
                  `bg-gradient-to-r ${config.gradient}`
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg", config.bg)}>
                    <PriorityIcon className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={rec.priority === "high" ? "danger" : rec.priority === "medium" ? "warning" : "info"}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-slate-500">{rec.category}</span>
                    </div>
                    <h4 className="font-semibold text-white">{rec.title}</h4>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-2">{rec.description}</p>
                    
                    {/* 進捗バー */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            progress === 100 
                              ? "bg-emerald-500" 
                              : `bg-gradient-to-r ${config.gradient.replace("/20", "")}`
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">
                        {completedCount}/{rec.actionItems.length}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 text-slate-400 transition-transform duration-300",
                      isExpanded && "rotate-90"
                    )}
                  />
                </div>
              </button>

              {/* 展開時のアクションアイテム */}
              {isExpanded && (
                <div className="p-4 pt-0 bg-slate-900/50">
                  <div className="border-t border-slate-800 pt-4 mt-2">
                    <h5 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      アクションアイテム
                    </h5>
                    <ul className="space-y-2">
                      {rec.actionItems.map((item, index) => {
                        const isCompleted = completedItems.has(`${rec.id}-${index}`);
                        return (
                          <li key={index}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleComplete(rec.id, index);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                isCompleted 
                                  ? "bg-emerald-500/10 border border-emerald-500/30" 
                                  : "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-500 flex-shrink-0" />
                              )}
                              <span
                                className={cn(
                                  "text-sm flex-1",
                                  isCompleted ? "text-emerald-300 line-through" : "text-slate-300"
                                )}
                              >
                                {item}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    
                    {/* 期待効果 */}
                    <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <ArrowRight className={cn("h-4 w-4", config.color)} />
                        <span className="text-sm text-slate-400">期待効果:</span>
                        <span className={cn("text-sm font-medium", config.color)}>
                          {rec.expectedImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Rocket className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>推奨事項はありません</p>
            <p className="text-sm mt-1">チャンネルは良好な状態です！</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
