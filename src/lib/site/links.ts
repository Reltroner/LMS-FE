// External destinations owned by Reltroner Studio. Each returned HTTP 200 when checked on
// 2026-10-29; Studio has no Terms page (404), so none is linked until one is published.
export const studioLinks = {
  home: "https://www.reltroner.com/",
  contact: "https://www.reltroner.com/contact",
  privacy: "https://www.reltroner.com/privacy",
  newsletterPreferences: "https://www.reltroner.com/newsletter/unsubscribe",
} as const;

export const academyUrl = "https://lms.reltroner.com/";

export type NavItem = Readonly<{ href: string; label: string; wideOnly?: boolean }>;

// wideOnly items collapse first on laptop widths: the logo already links Home, and the
// search button beside the nav opens the palette, whose footer links to full Search.
export const primaryNav: readonly NavItem[] = [
  { href: "/", label: "Home", wideOnly: true },
  { href: "/courses/", label: "Courses" },
  { href: "/paths/", label: "Paths" },
  { href: "/search/", label: "Search", wideOnly: true },
  { href: "/ai/", label: "AI Guide" },
  { href: "/about/", label: "About" },
];

export const ecosystemLinks = [
  {
    href: studioLinks.home,
    label: "Reltroner Studio",
    description: "Worldbuilding, Asthortera, stories, and creative exploration.",
    external: true,
  },
  {
    href: academyUrl,
    label: "Reltroner Learning",
    description: "Courses, learning paths, and creative practice.",
    external: false,
  },
] as const;

const trim = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

export function isActiveRoute(pathname: string | null, href: string) {
  if (!pathname) return false;
  const current = trim(pathname);
  const target = trim(href);
  return target === "/" ? current === "/" : current === target || current.startsWith(`${target}/`);
}
