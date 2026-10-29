import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { StatusNotice } from "@/components/ui/StatusNotice";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PageHero } from "@/components/marketing/PageHero";
import { studioLinks } from "@/lib/site/links";

export const metadata = {
  title: "Account",
  description: "Identity, preferences, and privacy for Reltroner Learning. Sign-in is not connected yet.",
};

// Sign-in is not implemented, so nothing here pretends to identify anyone. The only stored
// preference is the colour theme, kept in this browser by ThemeProvider.
export default function AccountPage() {
  return (
    <>
      <PageHero eyebrow="Identity & preferences" title="Account and learning preferences."
        lede="Sign in through Reltroner's identity service, then manage real learning settings — once those capabilities are connected.">
        <StatusNotice title="Sign-in is not connected yet" className="mt-6">
          The &ldquo;Sign in&rdquo; button leads here because there is no working sign-in on this site yet. You are not
          signed in, and no account information exists for you here.
        </StatusNotice>
      </PageHero>

      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Identity</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              When sign-in is connected, it will go through Reltroner&apos;s identity service at auth.reltroner.com.
              This site will never ask for or store your password.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Signing out will then end your session both here and at the identity service.
            </p>
            <span className="mt-4 inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              Integration required
            </span>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Learning preferences</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Colour theme — saved in this browser only.
            </p>
            <ThemeToggle showLabel className="mt-4" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A preferred lesson format (reading, video, audio…) is not available yet. Each lesson opens in Reading.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Data and privacy</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              <li>This site keeps no account, progress, or exercise data about you.</li>
              <li>Your theme choice is stored in your browser; clearing site data removes it.</li>
              <li>
                Newsletter subscriptions belong to Reltroner Studio.{" "}
                <ExternalLink href={studioLinks.newsletterPreferences} className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2">
                  Manage newsletter preferences
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href={studioLinks.privacy} className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2">
                  Reltroner Studio privacy policy
                </ExternalLink>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Learner pages</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Previews of what will hold your learning once records exist:</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/dashboard/" className="font-semibold text-primary hover:underline">Learner home</Link></li>
              <li><Link href="/my-learning/" className="font-semibold text-primary hover:underline">My Learning</Link></li>
            </ul>
          </Card>
        </div>
      </Container>
    </>
  );
}
