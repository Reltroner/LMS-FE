import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  ExternalLinkIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/ui/icons";
import { mockLearner } from "@/lib/fixtures/learner";

export const metadata = { title: "Account" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AccountPage() {
  return (
    <>
      <Section className="pb-4 pt-10">
        <Container size="md">
          <Badge tone="accent">LMS-safe profile</Badge>
          <Heading level={1} className="mt-3">Account</Heading>
          <p className="mt-2 text-muted-foreground">
            Only LMS-owned profile fields. Credential and credential management lives in the
            identity provider.
          </p>
        </Container>
      </Section>

      <Section className="pt-4">
        <Container size="md">
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            {/* Profile card */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
                  {mockLearner.displayName.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {mockLearner.displayName}
                  </h2>
                  <p className="text-sm text-muted-foreground">@{mockLearner.username}</p>
                  <Badge tone="success" className="mt-1">
                    {mockLearner.role}
                  </Badge>
                </div>
              </div>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <MailIcon width={16} height={16} className="text-muted-foreground" />
                  <dt className="w-24 shrink-0 text-muted-foreground">Email</dt>
                  <dd className="font-medium text-foreground">{mockLearner.email}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <UserIcon width={16} height={16} className="text-muted-foreground" />
                  <dt className="w-24 shrink-0 text-muted-foreground">Username</dt>
                  <dd className="font-medium text-foreground">{mockLearner.username}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldIcon width={16} height={16} className="text-muted-foreground" />
                  <dt className="w-24 shrink-0 text-muted-foreground">Role</dt>
                  <dd className="font-medium text-foreground">{mockLearner.role}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <LockIcon width={16} height={16} className="text-muted-foreground" />
                  <dt className="w-24 shrink-0 text-muted-foreground">Joined</dt>
                  <dd className="font-medium text-foreground">
                    {formatDate(mockLearner.joinedAt)}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 rounded-xl border border-border bg-background-elevated/50 p-4 text-xs text-muted-foreground">
                <strong className="text-foreground">No local credentials.</strong>{" "}
                Reltroner does not store passwords. Authentication is managed by the
                identity provider at{" "}
                <code className="rounded bg-background px-1 py-0.5 font-mono">
                  auth.reltroner.com/realms/reltroner
                </code>{" "}
                (Keycloak OIDC).
              </p>
            </Card>

            {/* Identity actions */}
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldIcon width={18} height={18} className="text-primary" />
                  Identity & security
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Password, MFA, and sessions are managed in your identity account.
                </p>
                <ButtonLink
                  href="https://auth.reltroner.com/realms/reltroner/account"
                  variant="secondary"
                  className="mt-4 w-full"
                  target="_blank"
                >
                  Manage credentials
                  <ExternalLinkIcon width={16} height={16} />
                </ButtonLink>
              </Card>

              <Card className="p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <ExternalLinkIcon width={18} height={18} className="text-accent-foreground" />
                  Sessions
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review active sessions and sign out from all devices.
                </p>
                <ButtonLink
                  href="https://auth.reltroner.com/realms/reltroner/account"
                  variant="ghost"
                  className="mt-4 w-full"
                  target="_blank"
                >
                  Open identity console
                  <ExternalLinkIcon width={16} height={16} />
                </ButtonLink>
              </Card>

              <div className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                <strong className="text-foreground">Prototype note:</strong> Links
                to the identity provider are illustrative. No local
                password-management UI will be built.
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
