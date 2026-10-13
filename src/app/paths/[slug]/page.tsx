import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { getPathBySlug } from "@/lib/fixtures/paths";
import { getCourseBySlug } from "@/lib/fixtures/courses";
import { getLessonsByCourseSlug } from "@/lib/fixtures/lessons";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CompassIcon,
  LayersIcon,
  LockIcon,
} from "@/components/ui/icons";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const { getPublishedPaths } = await import("@/lib/fixtures/paths");
  return getPublishedPaths().map((p) => ({ slug: p.slug }));
}

function PathDetailSkeleton() {
  return (
    <>
      <div className="border-b border-border bg-card/40">
        <Container>
          <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span>Paths</span>
            <span>/</span>
            <span className="h-3 w-32 animate-pulse rounded bg-muted-foreground/20" />
          </div>
        </Container>
      </div>

      <Section className="pb-6 pt-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="h-6 w-28 animate-pulse rounded-full bg-muted-foreground/15" />
                <span className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/15" />
              </div>
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted-foreground/20" />
              <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted-foreground/15" />
              <div className="flex gap-4 pt-4">
                <span className="h-4 w-24 animate-pulse rounded bg-muted-foreground/15" />
                <span className="h-4 w-20 animate-pulse rounded bg-muted-foreground/15" />
                <span className="h-4 w-20 animate-pulse rounded bg-muted-foreground/15" />
              </div>
            </div>

            <Card className="h-52 p-6 animate-pulse bg-card">
              <div className="space-y-4">
                <div className="h-6 w-28 rounded bg-muted-foreground/15" />
                <div className="h-4 w-full rounded bg-muted-foreground/15" />
                <div className="h-10 w-full rounded-xl bg-muted-foreground/20" />
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default function PathDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<PathDetailSkeleton />}>
      <PathDetailContent params={params} />
    </Suspense>
  );
}

async function PathDetailContent({ params }: Props) {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path || path.status !== "published") notFound();

  const courses = path.courseSlugs
    .map((s) => getCourseBySlug(s))
    .filter(Boolean);

  const totalLessons = courses.reduce(
    (sum, c) => sum + getLessonsByCourseSlug(c!.slug).length,
    0,
  );

  return (
    <>
      <div className="border-b border-border bg-card/40">
        <Container>
          <nav
            className="flex items-center gap-2 py-3 text-xs text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/paths" className="hover:text-primary">Paths</Link>
            <span>/</span>
            <span className="text-foreground">{path.title}</span>
          </nav>
        </Container>
      </div>

      <Section className="pb-6 pt-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Badge tone="accent">Learning path</Badge>
                <Badge tone="success">{path.status}</Badge>
              </div>
              <Heading level={1}>{path.title}</Heading>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {path.summary}
              </p>
              <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <LayersIcon width={16} height={16} />
                  <dd>{courses.length} courses</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon width={16} height={16} />
                  <dd>~{path.estimatedHours}h</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircleIcon width={16} height={16} />
                  <dd>{totalLessons} lessons</dd>
                </div>
              </dl>
            </div>

            <Card className="h-fit p-6">
              <CompassIcon width={28} height={28} className="text-accent-foreground" />
              <h2 className="mt-3 text-lg font-semibold text-foreground">
                Start the path
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Begin with the first course and progress through the sequence.
              </p>
              {courses[0] && (
                <ButtonLink
                  href={`/courses/${courses[0].slug}`}
                  className="mt-4 w-full"
                >
                  Start with {courses[0].title}
                  <ArrowRightIcon width={16} height={16} />
                </ButtonLink>
              )}
            </Card>
          </div>
        </Container>
      </Section>

      {/* Course sequence */}
      <Section className="pt-4">
        <Container size="md">
          <Heading level={2}>Progression</Heading>
          <p className="mt-3 text-muted-foreground">
            Complete courses in order. Later courses build on earlier ones.
          </p>

          <ol className="mt-8 space-y-4">
            {courses.map((course, i) => {
              const isLocked = i > 0; // prototype-only: mark later as locked
              return (
                <li key={course!.id}>
                  <Card className="overflow-hidden">
                    <div className="flex items-center gap-4 p-5 sm:p-6">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-foreground">
                            {course!.title}
                          </h3>
                          {isLocked && (
                            <Badge tone="warning">
                              <LockIcon width={12} height={12} />
                              Prerequisite
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {course!.summary}
                        </p>
                        <dl className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <LayersIcon width={12} height={12} />
                            <dd>{course!.modules.length} modules</dd>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon width={12} height={12} />
                            <dd>{course!.estimatedHours}h</dd>
                          </div>
                        </dl>
                      </div>
                      <Link
                        href={`/courses/${course!.slug}`}
                        className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:inline"
                      >
                        View course →
                      </Link>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>

          <div className="mt-8">
            <Badge tone="neutral">Prototype</Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              Progression and prerequisites are conceptual. Durable path
              progress is owned by the Learning Service, not this frontend.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
