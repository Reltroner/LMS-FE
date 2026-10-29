import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { ArrowRightIcon, CompassIcon, SparklesIcon } from "@/components/ui/icons";
import { PageHero, SectionHeading } from "@/components/marketing/PageHero";
import { ConceptImage } from "@/components/marketing/ConceptImage";
import { FlowSteps } from "@/components/learning/FlowSteps";
import { AvailabilityBadge } from "@/components/course/AvailabilityBadge";
import { ModuleRoadmap } from "@/components/course/ModuleRoadmap";
import { getCourseInventory, getPublishedCourses } from "@/lib/fixtures/courses";
import { getPublishedPaths } from "@/lib/fixtures/paths";
import { retrievePublicKnowledge } from "@/lib/knowledge/public-index";
import { courseRoute, lessonRoute, pathRoute } from "@/lib/routes/route-builders";
import { studioLinks } from "@/lib/site/links";
import { lessonNumber } from "@/components/search/result-meta";

// Answers "Why learn worldbuilding here, and where do I start?" using only published data.
// The Lumenhaven demonstrator and the AI Guide sample are retrieved from the public index at
// build time, so they appear only while that lesson content is actually published.
export default function HomePage() {
  const course = getPublishedCourses()[0];
  const inventory = course && getCourseInventory(course.slug);
  const firstLesson = inventory?.firstLesson;
  const firstNumber = lessonNumber(firstLesson?.slug);
  const path = getPublishedPaths()[0];
  const lumenhaven = retrievePublicKnowledge({ query: "Lumenhaven condition choice possible effect", limit: 1 })[0];
  // Prefer a lesson passage over the lesson's overview chunk: it shows what the Guide actually cites.
  const sampleResults = retrievePublicKnowledge({ query: "What is worldbuilding?", limit: 5 });
  const sample = sampleResults.find((r) => r.sourceType === "lesson" && r.sectionId !== "lesson-overview") ?? sampleResults[0];

  return (
    <>
      <PageHero
        eyebrow="Systemic Creative Architect"
        title="Turn an idea into a world of possibilities."
        lede="Explore how fictional conditions shape choices, consequences, and the next creative question."
        actions={course ? (
          <>
            <ButtonLink href={courseRoute(course.slug)} size="lg">
              Explore {course.title} <ArrowRightIcon width={18} height={18} />
            </ButtonLink>
            {firstLesson && (
              <ButtonLink href={lessonRoute(course.slug, firstLesson.slug)} variant="secondary" size="lg">
                Start Lesson {firstNumber ?? firstLesson.title}
              </ButtonLink>
            )}
          </>
        ) : (
          <ButtonLink href="/courses/" size="lg">Browse courses</ButtonLink>
        )}
        aside={<ConceptImage slot="HOME_HERO" priority />}
      >
        <p className="mt-5 text-sm text-muted-foreground">Start small. Discover connections. Build at your own pace.</p>
      </PageHero>

      <section aria-labelledby="start-heading" className="py-12">
        <Container>
          <SectionHeading eyebrow="Start here" id="start-heading" title="Your first meaningful connection"
            action={firstLesson && <AvailabilityBadge available label={`${firstNumber ? `Lesson ${firstNumber}` : firstLesson.title} available`} />} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <Card className="p-6 sm:p-8">
              {lumenhaven ? (
                <>
                  <FlowSteps label="Condition, choice, and possible effect in Lumenhaven" steps={[
                    { title: "Condition", detail: "Sharing a memory needs its owner's permission." },
                    { title: "Choice", detail: "The teacher changes the source used for class." },
                    { title: "Possible effect", detail: "Students encounter a different account." },
                  ]} />
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    In Lumenhaven, people keep memories inside glowing lanterns. Lumenhaven is an invented teaching
                    example, not official Asthortera canon. “Possible” matters: the model explains one plausible
                    connection — it does not promise a single predictable outcome.
                  </p>
                  <ButtonLink href={lumenhaven.sourceUrl} variant="secondary" className="mt-5">
                    Learn the model in the lesson <ArrowRightIcon width={16} height={16} />
                  </ButtonLink>
                </>
              ) : (
                <>
                  <FlowSteps label="Condition, choice, and possible effect" steps={[
                    { title: "Condition" }, { title: "Choice" }, { title: "Possible effect" },
                  ]} />
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    One imagined condition shapes the choices available to someone, and a choice can lead to a
                    possible effect. The first lesson that teaches this model is not published yet.
                  </p>
                </>
              )}
            </Card>
            <ConceptImage slot="HOME_CAUSAL_MODEL" />
          </div>
        </Container>
      </section>

      {course && inventory && (
        <section aria-labelledby="path-heading" className="py-12">
          <Container>
            <SectionHeading eyebrow="Follow a path" id="path-heading" title="Learn through a connected journey."
              lede={`${inventory.moduleCount} planned modules, ${inventory.availableLessonCount} published ${inventory.availableLessonCount === 1 ? "lesson" : "lessons"} so far. New lessons appear here only after they are written, reviewed, and published.`}
              action={path && (
                <ButtonLink href={pathRoute(path.slug)} variant="secondary">
                  <CompassIcon width={16} height={16} /> Explore the path
                </ButtonLink>
              )} />
            <Card className="mt-8 grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AvailabilityBadge available={inventory.availableLessonCount > 0}
                    label={`${inventory.availableLessonCount} ${inventory.availableLessonCount === 1 ? "lesson" : "lessons"} available`} />
                  <AvailabilityBadge available={false} label={`${inventory.moduleCount}-module plan`} />
                </div>
                <div className="mt-6"><ConceptImage slot="PATH_WOS_JOURNEY" /></div>
              </div>
              <ModuleRoadmap course={course} compact />
            </Card>
          </Container>
        </section>
      )}

      <section aria-labelledby="guide-heading" className="py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading eyebrow="AI Guide" id="guide-heading" title="Ask a question. Follow a source."
                lede="Search and the AI Guide answer from published lessons only, and every reply links to the passage it came from. When no AI model is connected, you get the passages themselves — never invented text." />
              <ButtonLink href="/ai/" className="mt-6">
                <SparklesIcon width={16} height={16} /> Open the AI Guide
              </ButtonLink>
            </div>
            {sample && (
              <Card className="space-y-3 p-5">
                <p className="ml-auto w-fit rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">What is worldbuilding?</p>
                <div className="rounded-2xl border border-border bg-background-elevated p-4">
                  <span className="rounded-full border border-primary/25 bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    Source excerpt · no AI-generated text
                  </span>
                  <p className="mt-3 text-sm leading-6 text-foreground">{sample.snippet}</p>
                  <Link href={sample.sourceUrl} className="mt-2 inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline">
                    {sample.title}{sample.heading && sample.heading !== sample.title ? ` — ${sample.heading}` : ""}
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">A real excerpt from the published index, retrieved when this page was built.</p>
              </Card>
            )}
          </div>
        </Container>
      </section>

      <section aria-labelledby="studio-heading" className="py-12">
        <Container>
          <h2 id="studio-heading" className="sr-only">Reltroner Learning and Reltroner Studio</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 sm:p-8">
              <p className="eyebrow">Creative practice</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Learn the method.</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Worldbuilding can help you practise exploring how rules, constraints, and choices affect an imagined
                world. Reltroner Learning teaches the methods, one lesson at a time.
              </p>
              <ButtonLink href="/about/" variant="secondary" className="mt-5">About Reltroner Learning</ButtonLink>
            </Card>
            <Card className="p-6 sm:p-8">
              <p className="eyebrow">The Studio connection</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Explore what it makes possible.</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Reltroner Studio develops stories, Asthortera, and creative experiments. You don&apos;t need to know
                any Studio lore to start learning here.
              </p>
              <ExternalLink href={studioLinks.home}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm hover:border-primary/30 hover:text-primary">
                Discover Reltroner Studio
              </ExternalLink>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
