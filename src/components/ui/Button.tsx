import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground shadow-[0_16px_36px_-18px_rgba(29,78,216,0.55)] hover:bg-primary/90",
  secondary:
    "border-border bg-card text-foreground shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-primary/5 hover:text-primary",
};

export function buttonClassNames({
  className,
  variant = "primary",
}: {
  className?: string;
  variant?: ButtonVariant;
}) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60",
    variantClassNames[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={buttonClassNames({ className, variant })} {...props} />;
}

type ButtonLinkProps = {
  children: React.ReactNode;
  className?: string;
  href: string;
  variant?: ButtonVariant;
};

export function ButtonLink({ children, className, href, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClassNames({ className, variant })}>
      {children}
    </Link>
  );
}
