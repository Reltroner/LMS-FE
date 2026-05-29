import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { site } from "@/lib/seo/site";

export function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-zinc-950">
          {site.name}
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/health" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
            Health
          </Link>
        </nav>
      </Container>
    </header>
  );
}
