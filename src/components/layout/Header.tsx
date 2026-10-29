"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { SearchIcon } from "@/components/ui/icons";
import { useSearchPalette, useShortcutLabel } from "@/components/search/SearchPaletteProvider";
import { isActiveRoute, primaryNav, studioLinks } from "@/lib/site/links";
import { BrandMark } from "./BrandMark";
import { EcosystemMenu } from "./EcosystemMenu";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

// No display utility here: cn() only joins classes, so "hidden" and "inline-flex" must never both
// apply — each link picks exactly one display rule below.
const navLink = "h-10 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-sm font-medium transition";

// Logo → Home → Courses → Paths → Search [Ctrl K] → AI Guide → About → Contact ↗ → Ecosystem ▾ →
// Theme → Sign in. Below lg the links move into MobileMenu; logo, search and menu stay visible.
// Sign-in is not connected: the link leads to the Account page, which explains that honestly.
export function Header() {
  const pathname = usePathname();
  const { openPalette } = useSearchPalette();
  const shortcut = useShortcutLabel();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-[76rem] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Reltroner Learning Academy home" className="mr-2 flex shrink-0 items-center gap-2.5">
          <BrandMark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {primaryNav.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={cn(navLink, item.wideOnly ? "hidden xl:inline-flex" : "inline-flex",
                  active ? "bg-primary-soft font-semibold text-primary" : "text-muted-foreground hover:bg-primary/5 hover:text-foreground")}>
                {item.label}
              </Link>
            );
          })}
          <ExternalLink href={studioLinks.contact}
            className={cn(navLink, "inline-flex text-muted-foreground hover:bg-primary/5 hover:text-foreground")}>
            Contact
          </ExternalLink>
          <EcosystemMenu />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => openPalette()} aria-label="Open search" aria-keyshortcuts="Control+K Meta+K"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground max-lg:w-10 max-lg:justify-center max-lg:px-0">
            <SearchIcon width={17} height={17} />
            <span className="hidden xl:inline">Search</span>
            <kbd aria-hidden="true" className="hidden rounded-md border border-border bg-background-elevated px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground lg:inline">
              {shortcut}
            </kbd>
          </button>
          <span className="hidden lg:flex"><ThemeToggle /></span>
          <Link href="/account/" aria-label="Sign in (prototype only — no real authentication)"
            aria-current={isActiveRoute(pathname, "/account/") ? "page" : undefined}
            className="hidden h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 lg:inline-flex">
            Sign in
            <span aria-hidden="true" className="hidden rounded border border-white/60 px-1 text-[10px] font-bold xl:inline">PREVIEW</span>
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
