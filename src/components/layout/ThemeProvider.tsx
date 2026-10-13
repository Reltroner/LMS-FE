"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "reltroner-lms-theme";

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // restricted storage fallback
  }
  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function getClientSnapshot(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function getServerSnapshot(): Theme {
  return "light";
}

let storeListeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  storeListeners.push(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMedia = () => {
    if (!getStoredTheme()) callback();
  };
  mql.addEventListener("change", handleMedia);

  return () => {
    storeListeners = storeListeners.filter((cb) => cb !== callback);
    window.removeEventListener("storage", handleStorage);
    mql.removeEventListener("change", handleMedia);
  };
}

function notifyStore() {
  for (const cb of storeListeners) {
    cb();
  }
}

const emptySubscribe = () => () => {};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("data-theme", next);
    notifyStore();
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getStoredTheme() ?? getSystemTheme();
    const next: Theme = current === "light" ? "dark" : "light";
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("data-theme", next);
    notifyStore();
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme, mounted }),
    [theme, toggleTheme, setTheme, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
