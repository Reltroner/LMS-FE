"use client";

import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted && theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} theme`;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={showLabel ? undefined : label}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
        showLabel ? "px-4 text-sm font-medium" : "w-10",
        className,
      )}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {showLabel && <span>{label}</span>}
    </button>
  );
}
