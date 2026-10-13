import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
};

export function Section({
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("py-12 sm:py-16 lg:py-20", className)}
      {...props}
    >
      {children}
    </section>
  );
}
