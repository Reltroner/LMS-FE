import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Surface styles are chosen by tone, not overridden through className: cn() only joins classes,
// so a second background or shadow utility would lose or win by stylesheet order, not intent.
const toneClasses = {
  surface: "border-border bg-card shadow-sm",
  muted: "border-border bg-background-elevated",
  primary: "border-primary/20 bg-primary-soft",
} as const;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  as?: "div" | "section" | "article";
  interactive?: boolean;
  tone?: keyof typeof toneClasses;
};

export function Card({
  children,
  className,
  as = "div",
  interactive = false,
  tone = "surface",
  ...props
}: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "rounded-3xl border text-card-foreground",
        toneClasses[tone],
        interactive &&
          "transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/20",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6 pb-4", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border p-6 pt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
