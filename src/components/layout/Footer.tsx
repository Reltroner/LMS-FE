import Link from "next/link";
import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { site } from "@/lib/seo/site";

const footerLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/paths", label: "Paths" },
  { href: "/search", label: "Search" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-white/80">
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/reltroner-mark.svg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl"
              />
              <div>
                <p className="font-semibold text-foreground">{site.name}</p>
                <p className="text-sm text-muted-foreground">Static, focused, learner-friendly.</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Engineering skills, AI skills, and project-based learning for long-term capability.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-3">
            {footerLinks.map((footerLink) => (
              <Link
                key={footerLink.href}
                href={footerLink.href}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {footerLink.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
