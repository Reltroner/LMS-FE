"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { MenuIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { ecosystemLinks, isActiveRoute, primaryNav, studioLinks } from "@/lib/site/links";
import { cn } from "@/lib/utils/cn";
import { PALETTE_OPEN_EVENT, useSearchPalette } from "@/components/search/SearchPaletteProvider";
import { ThemeToggle } from "./ThemeToggle";

// Below the lg breakpoint the navigation lives in this modal menu: focus moves in when it
// opens, Tab stays inside, and Escape (or the close button) returns focus to the trigger.
export function MobileMenu() {
  const id = useId();
  const pathname = usePathname();
  const { openPalette } = useSearchPalette();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a[href], button")?.focus();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const close = () => setOpen(false);
    const wide = window.matchMedia("(min-width: 1024px)");
    window.addEventListener(PALETTE_OPEN_EVENT, close);
    wide.addEventListener("change", close);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener(PALETTE_OPEN_EVENT, close);
      wide.removeEventListener("change", close);
    };
  }, [open]);

  function close(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  const itemClass = "flex min-h-11 items-center rounded-xl px-4 text-sm font-medium transition";

  return (
    <>
      <button ref={triggerRef} type="button" aria-expanded={open} aria-controls={`${id}-menu`}
        aria-label="Open menu" onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground lg:hidden">
        {open ? <XIcon /> : <MenuIcon />}
      </button>
      {/* Portalled to <body>: the header's backdrop-filter makes it the containing block for fixed
          descendants, which would size this overlay to the 64px header instead of the viewport. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[90] flex justify-end bg-[#040e21]/50 lg:hidden" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close(true);
        }}>
          <div ref={panelRef} id={`${id}-menu`} role="dialog" aria-modal="true" aria-label="Site menu" onKeyDown={onKeyDown}
            className="flex h-dvh w-full max-w-sm flex-col overflow-y-auto bg-card px-4 pb-6 pt-3 shadow-2xl">
            <div className="mb-2 flex h-12 shrink-0 items-center justify-between px-1">
              <p className="text-sm font-semibold text-foreground">Menu</p>
              <button type="button" onClick={() => close(true)} aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground">
                <XIcon />
              </button>
            </div>
            <nav aria-label="Mobile">
              <ul className="grid gap-1 sm:grid-cols-2">
                {primaryNav.map((item) => {
                  const active = isActiveRoute(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={active ? "page" : undefined} onClick={() => close(false)}
                        className={cn(itemClass, active ? "bg-primary-soft font-semibold text-primary" : "text-foreground hover:bg-background-elevated")}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <ExternalLink href={studioLinks.contact} onClick={() => close(false)}
                    className={cn(itemClass, "gap-1 text-foreground hover:bg-background-elevated")}>
                    Contact
                  </ExternalLink>
                </li>
              </ul>
            </nav>
            <button type="button" onClick={() => { close(false); openPalette(); }}
              className={cn(itemClass, "mt-2 w-full gap-2 border border-border text-foreground hover:bg-background-elevated")}>
              <SearchIcon width={16} height={16} /> Quick search
            </button>
            <p className="eyebrow mt-5 px-4">Ecosystem</p>
            <ul className="mt-1 grid gap-1">
              {ecosystemLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <ExternalLink href={link.href} className={cn(itemClass, "gap-1 text-foreground hover:bg-background-elevated")}>
                      {link.label}
                    </ExternalLink>
                  ) : (
                    <a href={link.href} className={cn(itemClass, "text-foreground hover:bg-background-elevated")}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border px-1 pt-4">
              <ThemeToggle showLabel />
              <Link href="/account/" onClick={() => close(false)} aria-label="Sign in (prototype only — no real authentication)"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground">
                Sign in <span aria-hidden="true" className="rounded bg-background-elevated px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">PREVIEW</span>
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
