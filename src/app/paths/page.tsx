import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-12">
      <Container>
        <div>
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
        </div>

        <div className="mt-7 sm:mt-8">
          {paths.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background-elevated">
                <CompassIcon width={26} height={26} className="text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                No published learning paths
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Learning paths under the Systemic Creative Architect domain are currently
                withheld until approved through the publication gate.
              </p>
            </Card>
          )}
        </div>
      </Container>
    </Section>
  );
}
