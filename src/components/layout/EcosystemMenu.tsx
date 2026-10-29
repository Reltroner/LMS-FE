"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRightIcon, ChevronDownIcon } from "@/components/ui/icons";
import { ecosystemLinks } from "@/lib/site/links";
import { cn } from "@/lib/utils/cn";
import { PALETTE_OPEN_EVENT } from "@/components/search/SearchPaletteProvider";

// Disclosure (not a route): opens by click, tap, Enter or Space; Escape and outside clicks close
// it, and Escape returns focus to the trigger.
export function EcosystemMenu({ className }: { className?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && !rootRef.current?.contains(event.relatedTarget)) setOpen(false);
    };
    const close = () => setOpen(false);
    const root = rootRef.current;
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    root?.addEventListener("focusout", onFocusOut);
    window.addEventListener(PALETTE_OPEN_EVENT, close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      root?.removeEventListener("focusout", onFocusOut);
      window.removeEventListener(PALETTE_OPEN_EVENT, close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button ref={triggerRef} type="button" aria-expanded={open} aria-controls={`${id}-panel`}
        onClick={() => setOpen((value) => !value)}
        className={cn("inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-medium transition",
          open ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-primary/5 hover:text-foreground")}>
        Ecosystem
        <ChevronDownIcon width={15} height={15} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      <div id={`${id}-panel`} hidden={!open}
        className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 rounded-2xl border border-border bg-card p-2 shadow-lg">
        <ul>
          {ecosystemLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                className="block rounded-xl p-3 transition hover:bg-background-elevated">
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  {link.label}
                  {link.external && <ArrowUpRightIcon width={14} height={14} />}
                  {link.external && <span className="sr-only"> (opens in a new tab)</span>}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{link.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
