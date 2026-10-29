import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonCurriculumNav } from "@/components/lesson/LessonCurriculumNav";
import { LessonMediaSwitcher } from "@/components/lesson/LessonMediaSwitcher";
import { resolveLessonMedia } from "@/lib/content/lesson-media";
import { getCourseBySlug } from "@/lib/fixtures/courses";
import { getLessonBySlug, getLessonNavigation, getLessonsByCourseSlug } from "@/lib/fixtures/lessons";
import { getLessonContent } from "@/lib/content/mdx";
import { getLessonRouteParams } from "@/lib/content/course-registry";
import { getResourcesByIds } from "@/lib/fixtures/resources";
import { courseRoute, lessonRoute } from "@/lib/routes/route-builders";
import {
  BookIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  TargetIcon,
} from "@/components/ui/icons";

const kindLabels: Record<string, string> = {
  lesson: "Lesson",
  lab: "Lab",
  checkpoint: "Checkpoint",
  capstone: "Capstone",
};

type Props = { params: Promise<{ slug: string; lesson: string }> };

export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const { slug, lesson } = await params;
  const course = getCourseBySlug(slug);
  const current = getLessonBySlug(slug, lesson);
  return course && current ? { title: `${current.title} — ${course.title}`, description: current.summary } : {};
}

export async function generateStaticParams() {
  const params = getLessonRouteParams();
  return params.length > 0 ? params : [{ slug: "_empty", lesson: "_empty" }];
}

function LessonReaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 py-10 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="h-4 w-64 animate-pulse rounded bg-muted-foreground/15" />
      <div className="mt-8 h-10 w-2/3 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-muted-foreground/15" />
      <div className="mt-8 h-72 max-w-[46rem] animate-pulse rounded-3xl bg-muted-foreground/10" />
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

  const current = getLessonBySlug(course.slug, lesson);
  if (!current) notFound();

  const navigation = getLessonNavigation(course.slug, lesson);
  if (!navigation) notFound();
  const { previous: prev, next } = navigation;

  const body = getLessonContent(course.slug, lesson);
  const media = resolveLessonMedia(current.media);
  const resources = getResourcesByIds(current.resourceIds);
  const titles = Object.fromEntries(getLessonsByCourseSlug(course.slug).map((l) => [l.slug, l.title]));

  // Where this lesson sits in the syllabus, and the next planned lesson when nothing newer is published.
  const moduleIndex = course.modules.findIndex((m) => m.lessonSlugs.includes(current.slug));
  const lessonModule = course.modules[moduleIndex];
  const syllabus = lessonModule?.syllabus ?? [];
  const entryIndex = syllabus.findIndex((entry) => entry.lessonSlug === current.slug);
  const number = syllabus[entryIndex]?.number;
  const upcoming = !next ? syllabus[entryIndex + 1] ?? null : null;

  const curriculum = <LessonCurriculumNav course={course} currentSlug={current.slug} titles={titles} />;

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 lg:px-8">
      <aside className="hidden lg:block" aria-label="Course curriculum">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto py-10 pr-2">
          <Link href={courseRoute(course.slug)} className="text-sm font-semibold text-foreground hover:text-primary">
            {course.title}
          </Link>
          <nav aria-label="Course lessons" className="mt-5">{curriculum}</nav>
        </div>
      </aside>

      <article className="min-w-0 max-w-[46rem] py-10">
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses/" },
          { label: course.title, href: courseRoute(course.slug) },
          { label: number ? `Lesson ${number}` : current.title },
        ]} />

        <details className="group mb-8 rounded-2xl border border-border bg-card lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            Course curriculum
            <ChevronDownIcon width={18} height={18} className="text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <nav aria-label="Course lessons (mobile)" className="border-t border-border px-2 py-4">{curriculum}</nav>
        </details>

        <div className="mb-8">
          <p className="eyebrow">
            {number ? `Lesson ${number}` : kindLabels[current.kind]}{lessonModule ? ` · ${lessonModule.title}` : ""}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{current.title}</h1>
          <p className="mt-3 text-lg leading-8 text-muted-foreground">{current.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="primary">{kindLabels[current.kind]}</Badge>
            <Badge tone="neutral">{current.level}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <ClockIcon width={14} height={14} /> About {current.durationMinutes} min
            </span>
          </div>
        </div>

        {current.objectives.length > 0 && (
          <Card tone="primary" className="mb-8 p-6">
            <div className="flex items-center gap-2">
              <TargetIcon width={20} height={20} className="text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Learning objectives</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {current.objectives.map((objective) => (
                <li key={objective} className="flex gap-2 text-sm leading-6 text-foreground">
                  <span aria-hidden="true" className="text-primary">•</span>{objective}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Body, plus optional alternative formats of the same lesson */}
        <LessonMediaSwitcher key={current.id} media={media} lessonTitle={current.title}>
          <LessonContent>{body}</LessonContent>
        </LessonMediaSwitcher>

        {current.outputs.length > 0 && (
          <Card className="mt-10 p-6">
            <div className="flex items-center gap-2">
              <FileTextIcon width={20} height={20} className="text-accent-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Expected outputs</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {current.outputs.map((output) => (
                <li key={output} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                  <span aria-hidden="true" className="text-accent-foreground">→</span>{output}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Keep your work in your own notes. This site does not upload or save exercise answers.
            </p>
          </Card>
        )}

        {resources.length > 0 && (
          <section className="mt-10" aria-labelledby="resources-heading">
            <h2 id="resources-heading" className="text-lg font-semibold text-foreground">References &amp; resources</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <Card className="p-4">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3">
                      <ExternalLinkIcon width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">{r.title}<span className="sr-only"> (opens in a new tab)</span></span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{r.summary}</span>
                      </span>
                    </a>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Lesson navigation" className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {prev ? (
            <ButtonLink href={lessonRoute(course.slug, prev.slug)} variant="secondary" size="lg">
              <ChevronLeftIcon width={18} height={18} />
              <span className="text-left">
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Previous</span>
                {prev.title}
              </span>
            </ButtonLink>
          ) : <span className="hidden sm:block" />}
          {next && (
            <ButtonLink href={lessonRoute(course.slug, next.slug)} size="lg">
              <span className="text-right">
                <span className="block text-[10px] uppercase tracking-wide opacity-80">Next</span>
                {next.title}
              </span>
              <ChevronRightIcon width={18} height={18} />
            </ButtonLink>
          )}
        </nav>

        {upcoming && (
          <Card tone="muted" className="mt-6 p-5">
            <p className="text-sm font-semibold text-foreground">Up next in the syllabus</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {upcoming.number} {upcoming.title} — planned, not yet published. New lessons appear in the course
              curriculum when they are ready.
            </p>
          </Card>
        )}

        <div className="mt-6">
          <ButtonLink href={courseRoute(course.slug)} variant="ghost">
            <BookIcon width={16} height={16} /> Back to course
          </ButtonLink>
        </div>
      </article>
    </div>
  );
}
