import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { AssistantPage } from "@/components/assistant/AssistantPage";

export const metadata = { title: "Assistant" };

export default function AssistantRoute() {
  return (
    <>
      <Section className="pb-4 pt-10">
        <Container size="md">
          <Badge tone="accent">Permission-aware · conceptual</Badge>
          <Heading level={1} className="mt-3">Learning Assistant</Heading>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            A conceptual assistant for learning support. It cannot change your
            progress, enrollments, or bookings — those are owned by backend
            services.
          </p>
        </Container>
      </Section>
      <AssistantPage />
    </>
  );
}
