import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  as?: "div" | "section" | "article";
  interactive?: boolean;
};

export function Card({
  children,
  className,
  as = "div",
  interactive = false,
  ...props
}: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "rounded-3xl border border-border bg-card text-card-foreground shadow-sm",
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
