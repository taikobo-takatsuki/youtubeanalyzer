import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  colorScheme?: "rose" | "sky" | "emerald" | "amber" | "violet";
}

const colorSchemes = {
  rose: {
    bg: "from-rose-500/20 to-orange-500/20",
    icon: "text-rose-400",
    border: "border-rose-500/20",
  },
  sky: {
    bg: "from-sky-500/20 to-cyan-500/20",
    icon: "text-sky-400",
    border: "border-sky-500/20",
  },
  emerald: {
    bg: "from-emerald-500/20 to-teal-500/20",
    icon: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  amber: {
    bg: "from-amber-500/20 to-yellow-500/20",
    icon: "text-amber-400",
    border: "border-amber-500/20",
  },
  violet: {
    bg: "from-violet-500/20 to-purple-500/20",
    icon: "text-violet-400",
    border: "border-violet-500/20",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  colorScheme = "rose",
}: StatCardProps) {
  const colors = colorSchemes[colorScheme];
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <Card className={cn("relative overflow-hidden", colors.border)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", colors.bg)} />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-white">{displayValue}</p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl bg-gradient-to-br", colors.bg)}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
