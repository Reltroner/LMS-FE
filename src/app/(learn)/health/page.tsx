import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";

export default function HealthPage() {
  return (
    <Section>
      <Container>
        <div className="space-y-3">
          <Heading level={1}>System Status</Heading>
          <p className="text-lg font-medium text-emerald-700">Healthy</p>
        </div>
      </Container>
    </Section>
  );
}
