import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "primary" | "accent" | "success" | "warning";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: BadgeTone;
};

const toneClassNames: Record<BadgeTone, string> = {
  neutral: "border-border bg-card text-muted-foreground",
  primary: "border-primary/15 bg-primary/10 text-primary",
  accent: "border-accent/20 bg-accent/10 text-accent-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
        toneClassNames[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
