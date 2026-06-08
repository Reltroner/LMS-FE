import { cn } from "@/lib/utils/cn";

type HeadingProps = {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
};

const baseClassName = "font-semibold tracking-normal text-foreground";

export function Heading({ children, className, level = 2 }: HeadingProps) {
  const classNames = {
    1: cn("text-4xl leading-tight sm:text-5xl lg:text-6xl", baseClassName, className),
    2: cn("text-3xl leading-tight sm:text-4xl", baseClassName, className),
    3: cn("text-2xl leading-snug", baseClassName, className),
  };

  if (level === 1) {
    return <h1 className={classNames[1]}>{children}</h1>;
  }

  if (level === 3) {
    return <h3 className={classNames[3]}>{children}</h3>;
  }

  return <h2 className={classNames[2]}>{children}</h2>;
}
