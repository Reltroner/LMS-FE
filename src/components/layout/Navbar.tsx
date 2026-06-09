"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRoles } from "@/hooks/use-auth-roles";

const navigationLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/paths", label: "Paths" },
  { href: "/search", label: "Search" },
] as const;

function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading, user, login } = useAuth();
  const { isAdmin, isInstructor } = useAuthRoles();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/82 shadow-[0_10px_40px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex min-w-0 items-center gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Image
              src="/brand/reltroner-mark.svg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-2xl"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold text-foreground">Reltroner</span>
              <span className="block truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Learning Academy
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <nav aria-label="Primary navigation" className="hidden items-center gap-2 md:flex">
              {navigationLinks.map((navigationLink) => {
                const isActive = isActiveLink(pathname, navigationLink.href);

                return (
                  <Link
                    key={navigationLink.href}
                    href={navigationLink.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[0_16px_34px_-24px_rgba(29,78,216,0.65)]"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    {navigationLink.label}
                  </Link>
                );
              })}
            </nav>

            {!isLoading &&
              (isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="hidden rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold tracking-wide text-red-800 transition hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:block"
                    >
                      Admin
                    </Link>
                  ) : isInstructor ? (
                    <Link
                      href="/instructor"
                      className="hidden rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold tracking-wide text-amber-900 transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:block"
                    >
                      Instructor
                    </Link>
                  ) : null}
                  <span className="hidden text-sm font-medium text-foreground md:block">
                    {user?.email || user?.name || "User"}
                  </span>
                  <Link
                    href="/logout"
                    className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Logout
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => login()}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_-24px_rgba(29,78,216,0.65)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Login
                </button>
              ))}

            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsOpen((current) => !current)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
            >
              {isOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 md:hidden",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <nav aria-label="Mobile navigation" className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-2 border-t border-border/80 py-4">
              {navigationLinks.map((navigationLink) => {
                const isActive = isActiveLink(pathname, navigationLink.href);

                return (
                  <Link
                    key={navigationLink.href}
                    href={navigationLink.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-base font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    {navigationLink.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}
