import { ButtonLink, buttonClassNames } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { PageHero, SectionHeading } from "@/components/marketing/PageHero";
import { ConceptImage } from "@/components/marketing/ConceptImage";
import { FlowSteps } from "@/components/learning/FlowSteps";
import { NumberedSteps } from "@/components/learning/NumberedSteps";
import { getCourseInventory, getPublishedCourses } from "@/lib/fixtures/courses";
import { lessonRoute } from "@/lib/routes/route-builders";
import { studioLinks } from "@/lib/site/links";

export const metadata = {
  title: "About",
  description: "Why Reltroner Learning exists, how it teaches through conditions, choices, and consequences, and what it does not claim.",
};

const approach = [
  { title: "Start from your question", text: "Each lesson opens with a situation where the idea would actually help." },
  { title: "Explain one mechanism", text: "One concrete example, examined closely, before any advanced theory." },
  { title: "Show evidence and limits", text: "What the example supports, what it does not, and what still needs checking." },
  { title: "Invite a next step", text: "A small piece of practice you can do with a notebook, not a test to pass." },
];

const limits = [
  "It is a creative learning approach to test in your own projects — not accreditation or a certificate.",
  "Fictional reasoning does not prove a real-world skill. Real problems need real information.",
  "Analogies between fiction and everyday life are offered with their differences spelled out, not as proof.",
  "This website is a tool for learning, not evidence that the method works.",
];

export default function AboutPage() {
  const course = getPublishedCourses()[0];
  const first = course && getCourseInventory(course.slug)?.firstLesson;

  return (
    <>
      <PageHero
        title="Why does a promising idea sometimes stop growing?"
        lede="Imagination creates a starting point. Understanding the relationships inside an idea can help you discover what it makes possible next — and that is what this academy sets out to teach."
        actions={
          <>
            {course && first && (
              <ButtonLink href={lessonRoute(course.slug, first.slug)} size="lg">
                Start learning
              </ButtonLink>
            )}
            <ExternalLink href={studioLinks.home} className={buttonClassNames({ variant: "secondary", size: "lg" })}>
              Discover Reltroner Studio
            </ExternalLink>
          </>
        }
        aside={<ConceptImage slot="ABOUT_CREATIVE_SEED" priority />}
      />

      <Container className="space-y-16">
        <section aria-labelledby="approach-heading">
          <SectionHeading id="approach-heading" title="How lessons are built"
            lede="Every lesson follows the same order, so you always know why you are reading something and how far it goes." />
          <NumberedSteps className="mt-8" steps={approach} />
        </section>

        <section aria-labelledby="model-heading">
          <SectionHeading id="model-heading" title="Conditions, choices, and possible effects"
            lede="Worldbuilding is practised here as a way of asking what changes when something imagined is true. The first model is deliberately small." />
          <FlowSteps className="mt-6" label="The first mental model" steps={[
            { title: "Condition", detail: "What is true, limited, or costly in this world?" },
            { title: "Choice", detail: "What does someone do differently because of it?" },
            { title: "Possible effect", detail: "What might change — and why?" },
          ]} />
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            “Possible” is a deliberate word: the model helps you ask better questions about one plausible connection.
            It is not a formula that predicts outcomes.
          </p>
        </section>

        <section aria-labelledby="destinations-heading">
          <SectionHeading id="destinations-heading" title="Reltroner Learning and Reltroner Studio" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr] lg:items-stretch">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">Reltroner Learning</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This site: methods, practice, reflection, and source-linked explanations. No Studio lore is required to start.
              </p>
              <ButtonLink href="/courses/" variant="secondary" className="mt-5">Explore courses</ButtonLink>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">Reltroner Studio</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Worldbuilding, Asthortera, narratives, and creative experiments — where the methods are put to work.
              </p>
              <ExternalLink href={studioLinks.home} className={buttonClassNames({ variant: "secondary", className: "mt-5" })}>
                Visit Reltroner Studio
              </ExternalLink>
            </Card>
            <ConceptImage slot="ABOUT_TWO_DESTINATIONS" />
          </div>
        </section>

        <section aria-labelledby="limits-heading">
          <SectionHeading id="limits-heading" title="What this is — and what it isn't" />
          <Card tone="muted" className="mt-6 p-6 sm:p-8">
            <ul className="space-y-3">
              {limits.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-foreground">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Your exercises stay in your own notes, you choose your own pace, and the AI Guide always shows its sources
              so you can disagree with it.
            </p>
          </Card>
        </section>

        {course && first && (
          <section aria-labelledby="cta-heading" className="surface-midnight rounded-3xl p-8 text-center sm:p-12">
            <h2 id="cta-heading" className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Start with one idea.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#c1d5ec]">
              The first published lesson takes about {first.durationMinutes} minutes and needs nothing but a notebook.
            </p>
            <ButtonLink href={lessonRoute(course.slug, first.slug)} size="lg" className="mt-6">
              Open {first.title}
            </ButtonLink>
          </section>
        )}
      </Container>
    </>
  );
}
