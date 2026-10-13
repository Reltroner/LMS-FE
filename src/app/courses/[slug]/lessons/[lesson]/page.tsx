import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { LessonContent } from "@/components/lesson/LessonContent";
import { getCourseBySlug } from "@/lib/fixtures/courses";
import { getLessonBySlug, getLessonsByCourseSlug } from "@/lib/fixtures/lessons";
import { getLessonContent } from "@/lib/fixtures/lesson-content";
import { getResourcesByIds } from "@/lib/fixtures/resources";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  TargetIcon,
  TerminalIcon,
  BookIcon,
} from "@/components/ui/icons";

const kindLabels: Record<string, string> = {
  lesson: "Lesson",
  lab: "Lab",
  checkpoint: "Checkpoint",
  capstone: "Capstone",
};

type Props = { params: Promise<{ slug: string; lesson: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const { getPublishedCourses } = await import("@/lib/fixtures/courses");
  const { getLessonsByCourseSlug } = await import("@/lib/fixtures/lessons");
  const params: { slug: string; lesson: string }[] = [];
  for (const c of getPublishedCourses()) {
    for (const l of getLessonsByCourseSlug(c.slug)) {
      params.push({ slug: c.slug, lesson: l.slug });
    }
  }
  return params;
}

function LessonReaderSkeleton() {
  return (
    <div className="lg:flex">
      {/* Curriculum sidebar skeleton */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/50 lg:block">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] p-5 space-y-4">
          <div className="h-5 w-44 animate-pulse rounded bg-muted-foreground/20" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/15" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-muted-foreground/15" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-muted-foreground/15" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-muted-foreground/15" />
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="min-w-0 flex-1">
        <div className="sticky top-16 z-20 border-b border-border bg-background/85 backdrop-blur">
          <Container size="md">
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <span>Home</span>
              <span>/</span>
              <span>Courses</span>
              <span>/</span>
              <span className="h-3 w-28 animate-pulse rounded bg-muted-foreground/20" />
              <span>/</span>
              <span className="h-3 w-36 animate-pulse rounded bg-muted-foreground/20" />
            </div>
          </Container>
        </div>

        <Section className="py-8">
          <Container size="md">
            <div className="space-y-6">
              <div className="flex gap-2">
                <span className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/15" />
                <span className="h-6 w-16 animate-pulse rounded-full bg-muted-foreground/15" />
              </div>
              <div className="h-9 w-2/3 animate-pulse rounded-lg bg-muted-foreground/20" />
              <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/15" />
              <div className="h-40 w-full animate-pulse rounded-xl bg-card border border-border" />
            </div>
          </Container>
        </Section>
      </div>
    </div>
  );
}

export default function LessonReaderPage({ params }: Props) {
  return (
    <Suspense fallback={<LessonReaderSkeleton />}>
      <LessonReaderContent params={params} />
    </Suspense>
  );
}

async function LessonReaderContent({ params }: Props) {
  const { slug, lesson } = await params;
  const course = getCourseBySlug(slug);
  if (!course || course.status !== "published") notFound();

  const lessons = getLessonsByCourseSlug(course.slug);
  const current = getLessonBySlug(lesson);
  if (!current) notFound();

  const idx = lessons.findIndex((l) => l.slug === lesson);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const blocks = getLessonContent(lesson);
  const resources = getResourcesByIds(current.resourceIds);

  // Build ordered lesson list across modules for sidebar
  const orderedLessons = course.modules.flatMap((m) => m.lessonSlugs);

  return (
    <div className="lg:flex">
      {/* Curriculum sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/50 lg:block">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-5">
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            {course.title}
          </Link>
          <nav aria-label="Course lessons" className="mt-5">
            <ol className="space-y-4">
              {course.modules.map((mod, mi) => {
                const modLessons = mod.lessonSlugs
                  .map((s) => getLessonBySlug(s))
                  .filter(Boolean);
                return (
                  <li key={mod.id}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Module {mi + 1}: {mod.title}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {modLessons.map((l) => {
                        const isActive = l!.slug === lesson;
                        const globalIdx = orderedLessons.indexOf(l!.slug);
                        return (
                          <li key={l!.id}>
                            <Link
                              href={`/courses/${course.slug}/lessons/${l!.slug}`}
                              aria-current={isActive ? "page" : undefined}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                isActive
                                  ? "bg-primary-soft font-semibold text-primary"
                                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background-elevated text-muted-foreground"
                                }`}
                              >
                                {globalIdx + 1}
                              </span>
                              <span className="truncate">{l!.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="sticky top-16 z-20 border-b border-border bg-background/85 backdrop-blur">
          <Container size="md">
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link href="/courses" className="hover:text-primary">Courses</Link>
              <span>/</span>
              <Link href={`/courses/${course.slug}`} className="hover:text-primary">
                {course.title}
              </Link>
              <span>/</span>
              <span className="truncate text-foreground">{current.title}</span>
            </div>
          </Container>
        </div>

        <Section className="pt-8">
          <Container size="md">
            {/* Lesson header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary">{kindLabels[current.kind]}</Badge>
                <Badge tone="neutral">{current.level}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ClockIcon width={14} height={14} />
                  {current.durationMinutes} min
                </span>
              </div>
              <Heading level={1} className="mt-4 text-3xl sm:text-4xl">
                {current.title}
              </Heading>
              <p className="mt-3 text-lg text-muted-foreground">
                {current.summary}
              </p>
            </div>

            {/* Objectives */}
            {current.objectives.length > 0 && (
              <Card className="mb-8 border-primary/20 bg-primary-soft/60 p-6">
                <div className="flex items-center gap-2">
                  <TargetIcon width={20} height={20} className="text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                    Learning objectives
                  </h2>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {current.objectives.map((obj, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="text-primary">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Body */}
            <LessonContent blocks={blocks} />

            {/* Outputs */}
            {current.outputs.length > 0 && (
              <Card className="mt-10 p-6">
                <div className="flex items-center gap-2">
                  <FileTextIcon width={20} height={20} className="text-accent-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Expected outputs
                  </h2>
                </div>
                <ul className="mt-3 space-y-2">
                  {current.outputs.map((o, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-accent-foreground">→</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-foreground">
                  References & resources
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {resources.map((r) => (
                    <Card key={r.id} className="p-4">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ExternalLinkIcon width={16} height={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground hover:text-primary">
                            {r.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {r.summary}
                          </p>
                        </div>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Prev / Next */}
            <nav
              aria-label="Lesson navigation"
              className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-between"
            >
              {prev ? (
                <ButtonLink
                  href={`/courses/${course.slug}/lessons/${prev.slug}`}
                  variant="secondary"
                  size="lg"
                >
                  <ChevronLeftIcon width={18} height={18} />
                  <span className="text-left">
                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Previous</span>
                    {prev.title}
                  </span>
                </ButtonLink>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <ButtonLink
                  href={`/courses/${course.slug}/lessons/${next.slug}`}
                  size="lg"
                >
                  <span className="text-right">
                    <span className="block text-[10px] uppercase tracking-wide opacity-80">Next</span>
                    {next.title}
                  </span>
                  <ChevronRightIcon width={18} height={18} />
                </ButtonLink>
              ) : (
                <span className="hidden sm:block" />
              )}
            </nav>

            {/* Back to course */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/courses/${course.slug}`} variant="ghost">
                <BookIcon width={16} height={16} />
                Back to course
              </ButtonLink>
              <Badge tone="neutral">
                <TerminalIcon width={12} height={12} />
                Prototype-only reader
              </Badge>
            </div>
          </Container>
        </Section>
      </div>
    </div>
  );
}
