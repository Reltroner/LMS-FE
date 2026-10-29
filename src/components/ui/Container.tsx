import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

// lg (the default) is the site measure, ~1216px; sm suits a 680–760px reading column.
const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-[76rem]",
  xl: "max-w-7xl",
};

export function Container({
  children,
  className,
  size = "lg",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
