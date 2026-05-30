import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { site } from "@/lib/seo/site";

const navigationLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/paths", label: "Paths" },
  { href: "/search", label: "Search" },
] as const;

export function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="rounded-sm text-sm font-semibold text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          {site.name}
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-6">
          {navigationLinks.map((navigationLink) => (
            <Link
              key={navigationLink.href}
              href={navigationLink.href}
              className="rounded-sm text-sm font-medium text-zinc-600 transition hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              {navigationLink.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
