"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import {
  BookIcon,
  CompassIcon,
  GraduationIcon,
  HomeIcon,
  LayoutIcon,
  MenuIcon,
  SearchIcon,
  SparklesIcon,
  UserIcon,
  XIcon,
} from "@/components/ui/icons";

const primaryNavItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/courses", label: "Courses", icon: BookIcon },
  { href: "/paths", label: "Paths", icon: CompassIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/mentorship", label: "Mentorship", icon: GraduationIcon },
];

const learnerNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: UserIcon },
  { href: "/my-learning", label: "My Learning", icon: BookIcon },
  { href: "/account", label: "Account", icon: UserIcon },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Prototype-only mock auth state. Not a real login.
  const [signedIn, setSignedIn] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
            <GraduationIcon width={20} height={20} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-foreground">
              Reltroner
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Learning Academy
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary-soft text-primary font-semibold"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                )}
              >
                <Icon width={16} height={16} />
                {item.label}
              </Link>
            );
          })}
          {signedIn && (
            <>
              <span className="mx-1 h-5 w-px bg-border" aria-hidden />
              {learnerNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
                      active
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                    )}
                  >
                    <Icon width={16} height={16} />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Separated prototype Admin link */}
          <Link
            href="/admin"
            className={cn(
              "hidden md:inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
              pathname?.startsWith("/admin") && "border-primary/40 bg-primary-soft font-semibold text-primary",
            )}
            title="Administrative prototype overview"
          >
            <LayoutIcon width={13} height={13} />
            <span>Admin</span>
            <span className="rounded bg-muted px-1 text-[10px] font-semibold text-muted-foreground">Demo</span>
          </Link>

          <ThemeToggle />
          {signedIn ? (
            <div className="hidden items-center gap-2 sm:flex">
              <ButtonLink href="/dashboard" variant="secondary" size="sm">
                <UserIcon width={16} height={16} />
                Dashboard
              </ButtonLink>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSignedIn(false)}
                aria-label="Sign out (prototype)"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setSignedIn(true)}
              aria-label="Sign in (prototype only — no real authentication)"
            >
              Sign in
              <span className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                PROTOTYPE
              </span>
            </Button>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border bg-card lg:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-foreground hover:bg-primary/5",
                    )}
                  >
                    <Icon width={18} height={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {signedIn && (
              <>
                <li className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Learner Workspace
                </li>
                {learnerNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/5"
                      >
                        <Icon width={18} height={18} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </>
            )}
            <li className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Prototypes
            </li>
            <li>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              >
                <span className="flex items-center gap-3">
                  <LayoutIcon width={18} height={18} />
                  Admin Console
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">Demo</span>
              </Link>
            </li>
            <li>
              <Link
                href="/assistant"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              >
                <SparklesIcon width={18} height={18} />
                Full Learning Assistant
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
