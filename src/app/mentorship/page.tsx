import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { mentorshipOfferings } from "@/lib/fixtures/mentorship";

export const metadata = { title: "Mentorship" };

const statusTone = {
  available: "success",
  limited: "warning",
  "coming-soon": "neutral",
} as const;

export default function MentorshipPage() {
  return (
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-12">
      <Container>
        <div>
          <Badge tone="accent">Conceptual offerings</Badge>
          <Heading level={1} className="mt-3">Mentorship</Heading>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Explore mentorship offerings that complement structured learning.
            This is a prototype discovery surface — bookings are simulated and
            do not call backend services.
          </p>
        </div>

        <div className="mt-7 sm:mt-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {mentorshipOfferings.map((o) => (
              <Card key={o.id} className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
                      <UsersIcon width={20} height={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{o.title}</h2>
                      <p className="text-sm text-muted-foreground">with {o.mentor}</p>
                    </div>
                  </div>
                  <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {o.summary}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <VideoIcon width={15} height={15} />
                    <dd>{o.format}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClockIcon width={15} height={15} />
                    <dd>{o.duration}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon width={15} height={15} />
                    <dd>Next: {o.nextAvailable}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UsersIcon width={15} height={15} />
                    <dd>{o.capacity}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {o.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-background-elevated px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">{o.priceLabel}</span>
                  {o.status === "coming-soon" ? (
                    <span className="text-sm font-semibold text-muted-foreground">
                      Not yet bookable
                    </span>
                  ) : (
                    <ButtonLink
                      href={`/mentorship/book?offering=${o.id}`}
                      size="sm"
                    >
                      Book a session
                    </ButtonLink>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Mentorship availability and bookings are prototype-only. Real
            lifecycle actions are owned by the Mentorship Service behind the API
            gateway.
          </p>
        </div>
      </Container>
    </Section>
  );
}
