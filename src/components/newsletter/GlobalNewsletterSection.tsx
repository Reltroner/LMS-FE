import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { newsletterIntegration } from "@/lib/newsletter/config";
import { studioLinks } from "@/lib/site/links";
import { NewsletterForm } from "./NewsletterForm";

// The one newsletter block, rendered by the root layout directly above the footer on every
// page. Subscribers belong to the canonical Reltroner Studio list; this site keeps no copy.
export function GlobalNewsletterSection() {
  const { mode, endpoint } = newsletterIntegration;
  return (
    <section aria-labelledby="newsletter-heading" data-newsletter-mode={mode} className="mt-16 sm:mt-20">
      <Container>
        <div className="surface-midnight grid gap-8 rounded-3xl p-6 shadow-lg sm:p-9 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8fe9f4]">Stay connected</p>
            <h2 id="newsletter-heading" className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Keep a little curiosity in your inbox.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#c1d5ec]">
              Occasional notes on creative practice, worldbuilding, and new public learning materials when
              available. No pressure to keep up.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li>
                <ExternalLink href={studioLinks.privacy} className="inline-flex min-h-6 items-center gap-1 font-semibold text-[#b8ddff] underline underline-offset-2">
                  Studio privacy
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href={studioLinks.newsletterPreferences} className="inline-flex min-h-6 items-center gap-1 font-semibold text-[#b8ddff] underline underline-offset-2">
                  Unsubscribe &amp; preferences
                </ExternalLink>
              </li>
            </ul>
          </div>
          <NewsletterForm mode={mode} endpoint={endpoint} />
        </div>
      </Container>
    </section>
  );
}
