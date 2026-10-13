import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { CourseCard } from "@/components/course/CourseCard";
import { PathCard } from "@/components/path/PathCard";
import {
  ArrowRightIcon,
  BookIcon,
  CheckCircleIcon,
  CompassIcon,
  LayersIcon,
  SparklesIcon,
  TargetIcon,
  TerminalIcon,
} from "@/components/ui/icons";
import { getPublishedCourses } from "@/lib/fixtures/courses";
import { getPublishedPaths } from "@/lib/fixtures/paths";
import { getLessonsByCourseSlug } from "@/lib/fixtures/lessons";

const valueCards = [
  {
    icon: BookIcon,
    title: "Engineering Skills",
    description:
      "Build foundations in backend systems, APIs, deployment thinking, and durable software practice.",
  },
  {
    icon: SparklesIcon,
    title: "AI Skills",
    description:
      "Learn how to reason with AI tools, structure prompts, and integrate automation into real work.",
  },
  {
    icon: TargetIcon,
    title: "Project-Based Learning",
    description:
      "Move through practical lessons, labs, checkpoints, and capstones that produce usable outputs.",
  },
] as const;

const methodologySteps = [
  { n: "01", title: "Clarity", desc: "Start from a clear, defined question or skill." },
  { n: "02", title: "Discovery", desc: "Explore concepts, examples, and boundaries." },
  { n: "03", title: "Understanding", desc: "Connect ideas into a coherent mental model." },
  { n: "04", title: "Structured Learning", desc: "Follow a deliberate, sequenced curriculum." },
  { n: "05", title: "Practice", desc: "Apply knowledge through labs and checkpoints." },
  { n: "06", title: "Progress → Capability", desc: "Track growth toward real capability." },
] as const;

export default function HomePage() {
  const courses = getPublishedCourses();
  const paths = getPublishedPaths();
  const totalLessons = courses.reduce(
    (sum, c) => sum + getLessonsByCourseSlug(c.slug).length,
    0,
  );

  return (
    <>
      {/* Hero */}
      <Section className="relative overflow-hidden pb-12 pt-10 sm:pt-14 lg:pb-20 lg:pt-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:items-center">
            <div className="space-y-8">
              <div className="space-y-5">
                <Badge tone="primary">Static-first learning system</Badge>
                <Heading level={1} className="max-w-4xl text-balance">
                  Learn engineering and creative systems that compound over time.
                </Heading>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  Reltroner Learning Academy teaches backend engineering, AI
                  literacy, and worldbuilding methodology through structured,
                  project-based courses — designed for clarity, not noise.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/courses" size="lg">
                  Explore courses
                  <ArrowRightIcon width={18} height={18} />
                </ButtonLink>
                <ButtonLink href="/paths" variant="secondary" size="lg">
                  <CompassIcon width={18} height={18} />
                  View learning paths
                </ButtonLink>
              </div>

              <dl className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Published courses", value: courses.length },
                  { label: "Lessons", value: totalLessons },
                  { label: "Learning paths", value: paths.length },
                ].map((stat) => (
                  <Card key={stat.label} className="p-5">
                    <dt className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd className="mt-2 text-3xl font-semibold text-foreground">
                      {stat.value}
                    </dd>
                  </Card>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="absolute inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
              <Card className="relative overflow-hidden p-4">
                <div className="aspect-[1.35] w-full rounded-[1.35rem] bg-gradient-to-br from-primary/15 via-accent/10 to-card p-6">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm">
                        <TerminalIcon width={20} height={20} className="text-primary" />
                      </span>
                      <Badge tone="primary">Live lesson preview</Badge>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Backend Engineering Fundamentals
                      </p>
                      <h3 className="text-xl font-semibold text-foreground">
                        HTTP Overview
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        The request and response model that powers backend
                        engineering.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircleIcon width={14} height={14} className="text-success" />
                        Readable, focused, and practical.
                      </div>
                    </div>
                    <Link
                      href="/courses/backend-engineering"
                      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Start reading <ArrowRightIcon width={14} height={14} />
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Value proposition */}
      <Section>
        <Container>
          <div className="space-y-8">
            <div className="max-w-3xl space-y-3">
              <Badge tone="accent">Why learn here</Badge>
              <Heading>Designed for steady capability</Heading>
              <p className="text-lg leading-8 text-muted-foreground">
                Clear pathways, readable lessons, and practical outputs keep the
                academy focused on skill growth instead of platform noise.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {valueCards.map((valueCard) => {
                const Icon = valueCard.icon;
                return (
                  <Card key={valueCard.title} className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon width={22} height={22} />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold text-foreground">
                      {valueCard.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {valueCard.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* Methodology */}
      <Section className="bg-background-elevated/40">
        <Container>
          <div className="space-y-8">
            <div className="max-w-3xl space-y-3">
              <Badge tone="primary">Learning philosophy</Badge>
              <Heading>Clarity → Discovery → Understanding → Capability</Heading>
              <p className="text-lg leading-8 text-muted-foreground">
                Every course follows a deliberate progression so beginners build
                confidence while advanced learners keep momentum.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {methodologySteps.map((step) => (
                <Card key={step.n} className="flex gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-sm font-bold text-primary">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured courses */}
      <Section>
        <Container>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl space-y-3">
                <Badge tone="primary">Featured published courses</Badge>
                <Heading>Start with a focused course</Heading>
                <p className="text-lg leading-8 text-muted-foreground">
                  Browse available courses from the static catalog and pick the
                  next useful skill. Only published content is shown publicly.
                </p>
              </div>
              <ButtonLink href="/courses" variant="secondary">
                View all courses
              </ButtonLink>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Learning paths */}
      <Section className="bg-background-elevated/40">
        <Container>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl space-y-3">
                <Badge tone="accent">Learning paths</Badge>
                <Heading>Follow a guided sequence</Heading>
                <p className="text-lg leading-8 text-muted-foreground">
                  Paths connect courses into a practical roadmap, so learners
                  can move with less guesswork.
                </p>
              </div>
              <ButtonLink href="/paths" variant="secondary">
                View all paths
              </ButtonLink>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container>
          <Card className="overflow-hidden">
            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <LayersIcon width={20} height={20} className="text-primary" />
                  <Badge tone="primary">Structured learning</Badge>
                </div>
                <Heading level={2}>
                  Ready to build durable skills?
                </Heading>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Start with a published course or follow a learning path. All
                  public content is statically delivered and free to explore.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/courses" size="lg">
                  Browse courses
                </ButtonLink>
                <ButtonLink href="/paths" variant="secondary" size="lg">
                  <CompassIcon width={18} height={18} />
                  Paths
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
