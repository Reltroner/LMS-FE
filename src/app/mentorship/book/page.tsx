import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/marketing/PageHero";
import { BookingJourney } from "@/components/mentorship/BookingJourney";

export const metadata = { title: "Mentorship request (preview)" };

export default function BookingPage() {
  return (
    <>
      <PageHero
        breadcrumb={<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Mentorship", href: "/mentorship/" }, { label: "Request preview" }]} />}
        eyebrow="Mentorship request"
        title="Describe what you'd like to work through."
        lede="A real request flow should be clear about availability, consent, and whether anything was actually submitted. This preview shows the steps without pretending to book." />
      <Container size="md">
        <BookingJourney />
      </Container>
    </>
  );
}
