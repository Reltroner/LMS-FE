import { cn } from "@/lib/utils/cn";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

export function Section({ children, className }: SectionProps) {
  return <section className={cn("py-14 sm:py-20 lg:py-24", className)}>{children}</section>;
}
