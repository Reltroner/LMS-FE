import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Surface styles are chosen by tone, not overridden through className: cn() only joins classes,
// so a second background or shadow utility would lose or win by stylesheet order, not intent.
// surface: content panel (border, no shadow); muted: notes and utility controls; primary: emphasis.
const toneClasses = {
  surface: "border-border bg-card",
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
        // Elevation only answers the pointer on a card that leads somewhere; nothing moves.
        interactive && "transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md",
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
