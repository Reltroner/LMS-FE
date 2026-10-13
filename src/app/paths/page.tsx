import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { PathCard } from "@/components/path/PathCard";
import { CompassIcon } from "@/components/ui/icons";
import { getPublishedPaths } from "@/lib/fixtures/paths";

export const metadata = {
  title: "Learning Paths",
  description:
    "Structured learning paths that sequence courses into a guided journey.",
};

export default function PathsPage() {
  const paths = getPublishedPaths();

  return (
    <>
      <Section className="pb-6 pt-10">
        <Container>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent-foreground">
              <CompassIcon width={22} height={22} />
            </span>
            <Badge tone="accent">Guided sequences</Badge>
          </div>
          <Heading level={1} className="mt-4">
            Learning Paths
          </Heading>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Follow a guided sequence of courses to build capability with less
            guesswork. Paths show prerequisites, progression, and expected
            outcomes.
          </p>
        </Container>
      </Section>

      <Section className="pt-4">
        <Container>
          <div className="grid gap-6 xl:grid-cols-2">
            {paths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
