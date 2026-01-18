import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border border-rose-500/30",
        success:
          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        warning:
          "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        danger:
          "bg-red-500/20 text-red-300 border border-red-500/30",
        info:
          "bg-sky-500/20 text-sky-300 border border-sky-500/30",
        outline:
          "border border-slate-600 text-slate-300",
        purple:
          "bg-violet-500/20 text-violet-300 border border-violet-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
