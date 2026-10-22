import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import { getCourseBySlug } from "@/lib/fixtures/courses";
import { getCourseRouteParams } from "@/lib/content/course-registry";
import { getLessonsByCourseSlug } from "@/lib/fixtures/lessons";
import { getResourcesByCourseSlug } from "@/lib/fixtures/resources";
import { getPathBySlug } from "@/lib/fixtures/paths";
import {
  BookIcon,
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LayersIcon,
  TargetIcon,
  TerminalIcon,
} from "@/components/ui/icons";

const categoryLabels: Record<string, string> = {
  "backend-engineering": "Backend Engineering",
  worldbuilding: "Worldbuilding",
  "creative-system": "Creative System",
};

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  "beginner-intermediate": "Beginner → Intermediate",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  // Only published courses are publicly routable.
  const params = getCourseRouteParams();
  return params.length > 0 ? params : [{ slug: "_empty" }];
}

function CourseDetailSkeleton() {
  return (
    <>
      <div className="border-b border-border bg-card/40">
        <Container>
          <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span>Courses</span>
            <span>/</span>
            <span className="h-3 w-32 animate-pulse rounded bg-muted-foreground/20" />
          </div>
        </Container>
      </div>

      <Section className="pb-6 pt-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-6 w-28 animate-pulse rounded-full bg-muted-foreground/15" />
                <span className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/15" />
                <span className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/15" />
              </div>
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted-foreground/20" />
              <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted-foreground/15" />
              <div className="flex gap-4 pt-4">
                <span className="h-11 w-40 animate-pulse rounded-xl bg-muted-foreground/20" />
                <span className="h-11 w-32 animate-pulse rounded-xl bg-muted-foreground/15" />
              </div>
            </div>
            <Card className="h-72 p-6 animate-pulse bg-card">
              <div className="space-y-4">
                <div className="h-4 w-24 rounded bg-muted-foreground/15" />
                <div className="h-4 w-full rounded bg-muted-foreground/15" />
                <div className="h-4 w-3/4 rounded bg-muted-foreground/15" />
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default function CourseDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetailContent params={params} />
    </Suspense>
  );
}

async function CourseDetailContent({ params }: Props) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course || course.status !== "published") {
    notFound();
  }

  const lessons = getLessonsByCourseSlug(course.slug);
  const resources = getResourcesByCourseSlug(course.slug);
  const totalMinutes = lessons.reduce((s, l) => s + l.durationMinutes, 0);
  const paths = course.pathSlugs
    .map((p) => getPathBySlug(p))
    .filter(Boolean);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/40">
        <Container>
          <nav className="flex items-center gap-2 py-3 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-primary">Courses</Link>
            <span>/</span>
            <span className="text-foreground">{course.title}</span>
          </nav>
        </Container>
      </div>

      {/* Hero */}
      <Section className="pb-6 pt-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary">{categoryLabels[course.category]}</Badge>
                <Badge tone="neutral">{levelLabels[course.level]}</Badge>
                {course.isSynthetic ? (
                  <Badge tone="neutral">Prototype Mock</Badge>
                ) : (
                  <Badge tone="success">{course.status}</Badge>
                )}
              </div>
              <Heading level={1}>{course.title}</Heading>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {course.subtitle}
              </p>
              {course.isSynthetic && (
                <div className="rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
                  <strong className="text-foreground">Prototype fixture:</strong> This course is a synthetic mock created to demonstrate catalog richness. It is not an active published Reltroner LMS course.
                </div>
              )}

              <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ClockIcon width={16} height={16} />
                  <dd>~{Math.round(totalMinutes / 60 * 10) / 10}h of lessons</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <LayersIcon width={16} height={16} />
                  <dd>{course.modules.length} modules</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookIcon width={16} height={16} />
                  <dd>{lessons.length} lessons</dd>
                </div>
                {course.finalDeliverable && (
                  <div className="flex items-center gap-1.5">
                    <FileTextIcon width={16} height={16} />
                    <dd>Deliverable: {course.finalDeliverable}</dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href={`/courses/${course.slug}/lessons/${lessons[0]?.slug ?? ""}`} size="lg">
                  <TerminalIcon width={18} height={18} />
                  Start first lesson
                </ButtonLink>
                <Button variant="secondary" size="lg">
                  Enroll (prototype)
                </Button>
              </div>
            </div>

            {/* Sidebar summary card */}
            <Card className="h-fit p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Course summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Level</dt>
                  <dd className="font-medium text-foreground">{levelLabels[course.level]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium text-foreground">{categoryLabels[course.category]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Est. effort</dt>
                  <dd className="font-medium text-foreground">{course.estimatedHours}h</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    {course.isSynthetic ? (
                      <Badge tone="neutral">Prototype Mock</Badge>
                    ) : (
                      <Badge tone="success">Published</Badge>
                    )}
                  </dd>
                </div>
              </dl>
              {paths.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">Part of</p>
                  {paths.map((p) => (
                    <Link
                      key={p!.id}
                      href={`/paths/${p!.slug}`}
                      className="mt-1 block text-sm font-semibold text-primary hover:underline"
                    >
                      {p!.title}
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Container>
      </Section>

      {/* Objectives + prerequisites */}
      <Section className="pt-4">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <TargetIcon width={20} height={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Learning objectives
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {(course.objectives ?? []).map((obj, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircleIcon
                      width={18}
                      height={18}
                      className="mt-0.5 shrink-0 text-success"
                    />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2">
                <LayersIcon width={20} height={20} className="text-accent" />
                <h2 className="text-lg font-semibold text-foreground">
                  Prerequisites
                </h2>
              </div>
              {course.prerequisiteCourseSlugs && course.prerequisiteCourseSlugs.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {course.prerequisiteCourseSlugs.map((slug) => {
                    const pre = getCourseBySlug(slug);
                    return (
                      <li key={slug} className="text-sm">
                        {pre ? (
                          <Link href={`/courses/${pre.slug}`} className="text-primary hover:underline">
                            {pre.title}
                          </Link>
                        ) : (
                          slug
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No formal prerequisites. This course is designed for beginners
                  with basic computer literacy.
                </p>
              )}
            </Card>
          </div>
        </Container>
      </Section>

      {/* Curriculum */}
      <Section className="pt-4">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-8">
              <div>
                <Heading level={2}>What you will learn</Heading>
                <p className="mt-3 text-muted-foreground">{course.summary}</p>
              </div>
              <CourseCurriculum course={course} />
            </div>

            <div className="space-y-6">
              {resources.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Resources
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {resources.map((r) => (
                      <li key={r.id}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-primary/5"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ExternalLinkIcon width={16} height={16} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary">
                              {r.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.summary}
                            </p>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card className="border-primary/20 bg-primary/5 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Prototype note
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enrollment and progress tracking are conceptual. Durable
                  learner state is owned by the Learning Service at
                  <code className="mx-1 rounded bg-card px-1 font-mono text-xs">
                    lms-api.reltroner.com
                  </code>
                  , not this frontend.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
