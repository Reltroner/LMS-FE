import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";

export default function Home() {
  return (
    <Section className="flex min-h-[calc(100vh-8rem)] items-center">
      <Container className="max-w-4xl">
        <div className="space-y-8">
          <Heading level={1}>Reltroner Learning Academy</Heading>
          <p className="max-w-2xl text-2xl font-medium leading-relaxed text-zinc-700 sm:text-3xl">
            Engineering Skills.
            <br />
            AI Skills.
            <br />
            Project-Based Learning.
          </p>
          <p className="text-lg font-medium text-zinc-500">Coming Soon.</p>
        </div>
      </Container>
    </Section>
  );
}
