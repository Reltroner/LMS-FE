import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground shadow-[0_16px_36px_-18px_rgba(29,78,216,0.55)] hover:bg-primary/90",
  secondary:
    "border-border bg-card text-foreground shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-primary/5 hover:text-primary",
  danger:
    "border-danger bg-danger text-white shadow-[0_16px_36px_-18px_rgba(185,28,28,0.5)] hover:bg-danger/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-xs",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-12 px-7 py-3 text-base",
};

export function buttonClassNames({
  className,
  variant = "primary",
  size = "md",
}: {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassNames({ className, variant, size })}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  children,
  className,
  href,
  variant = "primary",
  size = "md",
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonClassNames({ className, variant, size })}
      {...rest}
    >
      {children}
    </Link>
  );
}
