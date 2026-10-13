import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, icon, trailing, ...props }, ref) {
    return (
      <div className="relative w-full">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-12 w-full rounded-full border border-border bg-card px-5 text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-ring/30 focus:outline-none disabled:opacity-60",
            icon && "pl-12",
            trailing && "pr-12",
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {trailing}
          </span>
        )}
      </div>
    );
  },
);
