import { Suspense } from "react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { BookingJourney } from "@/components/mentorship/BookingJourney";

export const metadata = { title: "Book a Session" };

export default function BookingPage() {
  return (
    <>
      <Section className="pb-4 pt-10">
        <Container size="md">
          <Badge tone="accent">Prototype booking flow</Badge>
          <Heading level={1} className="mt-3">Book a mentorship session</Heading>
          <p className="mt-2 text-muted-foreground">
            Offering → Availability → Review → Confirmation → Status. This flow
            is simulated and does not call backend services.
          </p>
        </Container>
      </Section>
      <Suspense fallback={null}>
        <BookingJourney />
      </Suspense>
    </>
  );
}
