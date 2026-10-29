import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/marketing/PageHero";
import { PathCard } from "@/components/path/PathCard";
import { getPublishedPaths } from "@/lib/fixtures/paths";

export const metadata = {
  title: "Learning Paths",
  description: "A clear path from an idea to a connected world: guided sequences of published and planned lessons.",
};

const steps = [
  { title: "Discover", text: "Start with a relevant idea or question." },
  { title: "Practice", text: "Apply the mental model inside fiction." },
  { title: "Reflect", text: "Ask what might transfer to real situations — and what does not." },
];

export default function PathsPage() {
  const paths = getPublishedPaths();

  return (
    <>
      <PageHero eyebrow="Guided learning" title="A clear path from an idea to a connected world."
        lede="Follow a sequence designed to help your reasoning and creativity grow through meaningful practice. Each stage shows what you can open today and what is still planned." />
      <Container>
        <div className="space-y-8">
          {paths.length > 0 ? (
            paths.map((path) => <PathCard key={path.id} path={path} />)
          ) : (
            <Card className="p-10 text-center">
              <h2 className="text-lg font-semibold text-foreground">No learning paths are published yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Paths appear once the courses they follow have published lessons. This isn&apos;t about your
                access — there is nothing to show yet.
              </p>
            </Card>
          )}

          <Card tone="muted" className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">How paths work</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A path puts related lessons in a meaningful order. It tells you where to start — not which
              achievements you have earned. A path follows its course; it is not a set of separate courses.
            </p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-1 font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </Container>
    </>
  );
}
