import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { BrandMark } from "./BrandMark";
import { studioLinks } from "@/lib/site/links";

const linkClass = "inline-flex min-h-6 items-center gap-1 text-sm text-muted-foreground transition hover:text-primary";

// Only destinations that exist: internal routes, and Studio pages verified to resolve.
// No Terms link until Studio publishes one; no social links until verified accounts are listed.
export function Footer() {
  return (
    <footer className="mt-12 border-t border-border">
      <Container>
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Reltroner Learning Academy home">
              <BrandMark />
            </Link>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Systems thinking, worldbuilding methodology, and creative constraints for independent creators.
            </p>
            <p className="text-sm font-semibold text-foreground">Build Worlds. Connect Ideas. Create Possibilities.</p>
          </div>

          <nav aria-labelledby="footer-learn">
            <h2 id="footer-learn" className="text-sm font-semibold text-foreground">Learn</h2>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/courses/" className={linkClass}>Courses</Link></li>
              <li><Link href="/paths/" className={linkClass}>Learning Paths</Link></li>
              <li><Link href="/search/" className={linkClass}>Search</Link></li>
              <li><Link href="/ai/" className={linkClass}>AI Guide</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-ecosystem">
            <h2 id="footer-ecosystem" className="text-sm font-semibold text-foreground">Ecosystem</h2>
            <ul className="mt-4 space-y-2.5">
              <li><ExternalLink href={studioLinks.home} className={linkClass}>Reltroner Studio</ExternalLink></li>
              <li><Link href="/about/" className={linkClass}>About Reltroner Learning</Link></li>
              <li><Link href="/mentorship/" className={linkClass}>Mentorship</Link></li>
              <li><ExternalLink href={studioLinks.contact} className={linkClass}>Contact</ExternalLink></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-policies">
            <h2 id="footer-policies" className="text-sm font-semibold text-foreground">Policies</h2>
            <ul className="mt-4 space-y-2.5">
              <li><ExternalLink href={studioLinks.privacy} className={linkClass}>Privacy</ExternalLink></li>
              <li><ExternalLink href={studioLinks.newsletterPreferences} className={linkClass}>Newsletter preferences</ExternalLink></li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 Reltroner Studio. All rights reserved.</p>
          <p>A learning experience within the Reltroner ecosystem.</p>
        </div>
      </Container>
    </footer>
  );
}
