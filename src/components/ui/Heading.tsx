import { createElement, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = {
  level?: HeadingLevel;
  children: ReactNode;
  className?: string;
  id?: string;
};

const levelClasses: Record<HeadingLevel, string> = {
  1: "text-4xl font-bold tracking-tight sm:text-5xl",
  2: "text-3xl font-bold tracking-tight sm:text-4xl",
  3: "text-2xl font-semibold tracking-tight sm:text-3xl",
  4: "text-xl font-semibold tracking-tight",
  5: "text-lg font-semibold",
  6: "text-base font-semibold",
};

export function Heading({
  level = 2,
  children,
  className,
  ...rest
}: HeadingProps) {
  return createElement(
    `h${level}`,
    {
      className: cn(
        "text-foreground",
        levelClasses[level],
        className,
      ),
      ...rest,
    },
    children,
  );
}
