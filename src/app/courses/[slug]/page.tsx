import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, BookIcon, CompassIcon, FileTextIcon, HeadphonesIcon, ImageIcon, VideoIcon } from "@/components/ui/icons";
import { PageHero, SectionHeading } from "@/components/marketing/PageHero";
import { ConceptImage } from "@/components/marketing/ConceptImage";
import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import { AvailabilityBadge } from "@/components/course/AvailabilityBadge";
import { categoryLabels, levelLabels } from "@/components/course/CourseCard";
import { getCourseBySlug, getCourseInventory } from "@/lib/fixtures/courses";
import { getCourseRouteParams } from "@/lib/content/course-registry";
import { getLessonsByCourseSlug } from "@/lib/fixtures/lessons";
import { getPathBySlug } from "@/lib/fixtures/paths";
import { courseCoverSlots } from "@/lib/media/image-slots";
import { lessonRoute, pathRoute } from "@/lib/routes/route-builders";
import { lessonNumber } from "@/components/search/result-meta";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const course = getCourseBySlug((await params).slug);
  return course ? { title: course.title, description: course.subtitle } : {};
}

export async function generateStaticParams() {
  // Only published courses are publicly routable.
  const params = getCourseRouteParams();
  return params.length > 0 ? params : [{ slug: "_empty" }];
}

const outcomes = [
  { title: "Imagine", text: "Form a small fictional idea you can actually examine." },
  { title: "Connect", text: "See how one condition shapes the choices someone can make." },
  { title: "Question", text: "Explain a possible consequence — and what it does not prove." },
];

function CourseDetailSkeleton() {
  return (
    <Container className="py-14" aria-hidden="true">
      <div className="h-4 w-48 animate-pulse rounded bg-muted-foreground/15" />
      <div className="mt-8 h-12 w-3/4 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-muted-foreground/15" />
      <div className="mt-8 h-64 animate-pulse rounded-3xl bg-muted-foreground/10" />
    </Container>
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
  if (!course || course.status !== "published") notFound();

  const lessons = getLessonsByCourseSlug(course.slug);
  const inventory = getCourseInventory(course.slug)!;
  const first = inventory.firstLesson;
  const firstNumber = lessonNumber(first?.slug);
  const path = course.pathSlugs.map((p) => getPathBySlug(p)).find(Boolean);
  const cover = courseCoverSlots[course.slug];
  const formats = [
    { label: "Reading", icon: BookIcon, present: true },
    { label: "Video", icon: VideoIcon, present: Boolean(first?.media?.video) },
    { label: "Audio", icon: HeadphonesIcon, present: Boolean(first?.media?.audio) },
    { label: "Slides", icon: FileTextIcon, present: Boolean(first?.media?.slides) },
    { label: "Infographic", icon: ImageIcon, present: Boolean(first?.media?.infographic) },
  ].filter((format) => format.present);

  return (
    <>
      <PageHero
        breadcrumb={<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Courses", href: "/courses/" }, { label: course.title }]} />}
        eyebrow={`${categoryLabels[course.category]} · ${levelLabels[course.level]}`}
        title={course.title}
        lede={course.subtitle}
        actions={
          <>
            {first && (
              <ButtonLink href={lessonRoute(course.slug, first.slug)} size="lg">
                Start {firstNumber ? `Lesson ${firstNumber}` : first.title} <ArrowRightIcon width={18} height={18} />
              </ButtonLink>
            )}
            {path && (
              <ButtonLink href={pathRoute(path.slug)} variant="secondary" size="lg">
                <CompassIcon width={18} height={18} /> View learning path
              </ButtonLink>
            )}
          </>
        }
        aside={cover && <ConceptImage slot={cover} priority />}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <AvailabilityBadge available={inventory.availableLessonCount > 0}
            label={`${inventory.availableLessonCount} ${inventory.availableLessonCount === 1 ? "lesson" : "lessons"} available`} />
          <AvailabilityBadge available={false} label={`${inventory.moduleCount}-module planned curriculum`} />
          <AvailabilityBadge available={false} label="English" />
        </div>
      </PageHero>

      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-14">
            <section aria-labelledby="outcomes-heading">
              <SectionHeading eyebrow="Learning outcomes" id="outcomes-heading" title="What you'll start exploring" lede={course.summary} />
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {outcomes.map((outcome) => (
                  <li key={outcome.title}>
                    <Card className="h-full p-5">
                      <h3 className="font-semibold text-foreground">{outcome.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{outcome.text}</p>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>

            {first && (
              <section aria-labelledby="activity-heading">
                <SectionHeading eyebrow="Example activity" id="activity-heading" title="Your first piece of practice" />
                <Card className="mt-6 p-6">
                  <p className="text-sm leading-6 text-foreground">
                    In <Link href={lessonRoute(course.slug, first.slug)} className="font-semibold text-primary underline-offset-2 hover:underline">{first.title}</Link>{" "}
                    you produce: <strong>{first.outputs[0]}</strong>.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    A notebook or a few lines in a text file are enough. Nothing you write is uploaded or saved by this site.
                  </p>
                </Card>
              </section>
            )}

            {first && (
              <section aria-labelledby="formats-heading">
                <SectionHeading eyebrow="Formats" id="formats-heading" title="One lesson, several ways in"
                  lede={`Reading is always available. ${firstNumber ? `Lesson ${firstNumber}` : first.title} also offers the formats below; formats vary by lesson.`} />
                <ul className="mt-6 flex flex-wrap gap-3">
                  {formats.map(({ label, icon: Icon }) => (
                    <li key={label} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
                      <Icon width={16} height={16} className="text-primary" /> {label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="curriculum-heading">
              <SectionHeading eyebrow="Curriculum" id="curriculum-heading" title="Course curriculum"
                lede={`${inventory.moduleCount} modules and ${inventory.plannedLessonCount} planned lessons. ${inventory.availableLessonCount} ${inventory.availableLessonCount === 1 ? "is" : "are"} published; the rest are planned, not locked.`} />
              <div className="mt-6"><CourseCurriculum course={course} lessons={lessons} /></div>
            </section>
          </div>

          <aside className="space-y-5" aria-label="Course details">
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground">How lessons are published</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Lessons are written, reviewed, and published one at a time. Planned lessons are part of the proposed
                syllabus; they are not locked or paywalled — they have not been written yet.
              </p>
            </Card>
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground">Before you start</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                No prerequisites. Designed for beginners; about {first?.durationMinutes ?? 20} minutes for the first lesson.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Progress is not saved on this site yet, so you can start, stop, and revisit freely.
              </p>
            </Card>
            {course.finalDeliverable && (
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground">Planned course outcome</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  When the full course is published, it builds toward a {course.finalDeliverable}.
                </p>
              </Card>
            )}
            {path && (
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground">Part of a learning path</h2>
                <Link href={pathRoute(path.slug)} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {path.title} <ArrowRightIcon width={14} height={14} />
                </Link>
              </Card>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
