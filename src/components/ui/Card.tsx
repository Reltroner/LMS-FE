import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card text-card-foreground shadow-[0_24px_80px_-58px_rgba(15,23,42,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
