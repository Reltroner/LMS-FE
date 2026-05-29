type HeadingProps = {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
};

const baseClassName = "font-semibold tracking-normal text-zinc-950";

export function Heading({ children, className, level = 2 }: HeadingProps) {
  const classNames = {
    1: `text-4xl sm:text-5xl ${baseClassName} ${className ?? ""}`,
    2: `text-3xl sm:text-4xl ${baseClassName} ${className ?? ""}`,
    3: `text-2xl ${baseClassName} ${className ?? ""}`,
  };

  if (level === 1) {
    return <h1 className={classNames[1]}>{children}</h1>;
  }

  if (level === 3) {
    return <h3 className={classNames[3]}>{children}</h3>;
  }

  return <h2 className={classNames[2]}>{children}</h2>;
}
