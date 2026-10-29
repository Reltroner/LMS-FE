"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode,
} from "react";
import { GlobalSearchPalette } from "./GlobalSearchPalette";

type PaletteContext = Readonly<{ isOpen: boolean; openPalette: (query?: string) => void }>;

const Context = createContext<PaletteContext | null>(null);

// Other overlays (mobile menu, ecosystem menu, floating assistant) close on this event so the
// palette is never stacked on another dialog.
export const PALETTE_OPEN_EVENT = "reltroner:palette-open";

// Owns the single global palette and the one Ctrl+K / ⌘K listener for the whole site.
export function SearchPaletteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; query: string; session: number }>({ open: false, query: "", session: 0 });
  const returnFocus = useRef<HTMLElement | null>(null);
  const isOpen = useRef(false);

  const openPalette = useCallback((query = "") => {
    if (isOpen.current) return;
    isOpen.current = true;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.dispatchEvent(new Event(PALETTE_OPEN_EVENT));
    setState((s) => ({ open: true, query, session: s.session + 1 }));
  }, []);

  const closePalette = useCallback((restoreFocus: boolean) => {
    isOpen.current = false;
    setState((s) => ({ ...s, open: false }));
    const target = returnFocus.current;
    returnFocus.current = null;
    if (restoreFocus && target?.isConnected) requestAnimationFrame(() => target.focus());
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) return; // IME composition
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== "k") return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.isContentEditable) return; // leave rich-text editors' own Ctrl+K alone
      event.preventDefault();
      if (isOpen.current) closePalette(true);
      else openPalette();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPalette, closePalette]);

  const value = useMemo(() => ({ isOpen: state.open, openPalette }), [state.open, openPalette]);
  return (
    <Context.Provider value={value}>
      {children}
      {state.open && (
        <GlobalSearchPalette key={state.session} initialQuery={state.query} onClose={closePalette} />
      )}
    </Context.Provider>
  );
}

export function useSearchPalette() {
  const context = useContext(Context);
  if (!context) throw new Error("useSearchPalette must be used inside SearchPaletteProvider");
  return context;
}

const noSubscription = () => () => {};
const platformShortcut = () => {
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad/i.test(platform) ? "⌘ K" : "Ctrl K";
};

// The platform is only knowable in the browser; prerendered HTML shows the Windows/Linux label.
export function useShortcutLabel() {
  return useSyncExternalStore(noSubscription, platformShortcut, () => "Ctrl K");
}
