import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone =
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-primary-soft text-primary border-primary/20",
  accent: "bg-accent-soft text-accent-foreground border-accent/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  neutral: "bg-background-elevated text-muted-foreground border-border",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  "aria-label"?: string;
};

export function Badge({
  children,
  tone = "neutral",
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
