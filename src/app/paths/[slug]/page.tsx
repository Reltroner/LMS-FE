import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, BookIcon } from "@/components/ui/icons";
import { PageHero, SectionHeading } from "@/components/marketing/PageHero";
import { ConceptImage } from "@/components/marketing/ConceptImage";
import { ModuleRoadmap } from "@/components/course/ModuleRoadmap";
import { AvailabilityBadge } from "@/components/course/AvailabilityBadge";
import { getPathBySlug } from "@/lib/fixtures/paths";
import { getCourseBySlug, getCourseInventory } from "@/lib/fixtures/courses";
import { courseRoute, lessonRoute } from "@/lib/routes/route-builders";
import { lessonNumber } from "@/components/search/result-meta";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const path = getPathBySlug((await params).slug);
  return path ? { title: `${path.title} learning path`, description: path.subtitle } : {};
}

export async function generateStaticParams() {
  const { getPublishedPaths } = await import("@/lib/fixtures/paths");
  const paths = getPublishedPaths();
  return paths.length > 0 ? paths.map((p) => ({ slug: p.slug })) : [{ slug: "_empty" }];
}

function PathDetailSkeleton() {
  return (
    <Container className="py-14" aria-hidden="true">
      <div className="h-4 w-48 animate-pulse rounded bg-muted-foreground/15" />
      <div className="mt-8 h-12 w-3/4 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="mt-8 h-64 animate-pulse rounded-3xl bg-muted-foreground/10" />
    </Container>
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

  const courses = path.courseSlugs.map((s) => getCourseBySlug(s)).filter((c) => c !== undefined);
  const inventories = courses.map((course) => getCourseInventory(course.slug)!);
  const available = inventories.reduce((n, i) => n + i.availableLessonCount, 0);
  const planned = inventories.reduce((n, i) => n + i.plannedLessonCount, 0);
  const modules = inventories.reduce((n, i) => n + i.moduleCount, 0);
  const startIndex = inventories.findIndex((i) => i.firstLesson);
  const start = startIndex >= 0 ? { course: courses[startIndex], lesson: inventories[startIndex].firstLesson! } : null;
  const startNumber = lessonNumber(start?.lesson.slug);

  return (
    <>
      <PageHero
        breadcrumb={<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Paths", href: "/paths/" }, { label: path.title }]} />}
        eyebrow="Learning journey"
        title={path.title}
        lede={path.summary}
        actions={
          <>
            {start && (
              <ButtonLink href={lessonRoute(start.course.slug, start.lesson.slug)} size="lg">
                Begin with {startNumber ? `Lesson ${startNumber}` : start.lesson.title} <ArrowRightIcon width={18} height={18} />
              </ButtonLink>
            )}
            {courses[0] && (
              <ButtonLink href={courseRoute(courses[0].slug)} variant="secondary" size="lg">
                <BookIcon width={18} height={18} /> View course curriculum
              </ButtonLink>
            )}
          </>
        }
        aside={<ConceptImage slot="PATH_WOS_JOURNEY" priority />}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <AvailabilityBadge available={available > 0} label={`${available} of ${planned} lessons published`} />
          <AvailabilityBadge available={false} label={`${modules} stages`} />
          <AvailabilityBadge available={false} label={`About ${path.estimatedHours} hours when complete`} />
        </div>
      </PageHero>

      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-labelledby="route-heading" className="min-w-0">
            <SectionHeading eyebrow="Sequence" id="route-heading" title="Learning route"
              lede="Each stage is a module of the course this path follows. Published lessons open in the reader; planned stages are listed so you can see where the path is going — without promising dates." />
            {courses.map((course) => (
              <Card key={course.id} className="mt-6 p-6 sm:p-8">
                <p className="mb-5 text-sm text-muted-foreground">
                  Lessons belong to <Link href={courseRoute(course.slug)} className="font-semibold text-primary hover:underline">{course.title}</Link>;
                  this path sets their order.
                </p>
                <ModuleRoadmap course={course} showLessons />
              </Card>
            ))}
          </section>

          <aside className="space-y-5" aria-label="Getting started">
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground">How to start</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>{start ? <>Open {startNumber ? `Lesson ${startNumber}` : start.lesson.title} and read at your own pace.</> : "Wait for the first lesson to be published."}</li>
                <li>Keep your exercise notes yourself — this site does not save them.</li>
                <li>Come back to the course curriculum to see newly published lessons.</li>
              </ol>
            </Card>
            <Card tone="muted" className="p-6">
              <h2 className="text-base font-semibold text-foreground">About progress</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Personal progress is not tracked yet. Nothing on this page reflects what you have read or completed.
              </p>
            </Card>
          </aside>
        </div>
      </Container>
    </>
  );
}
