import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PathCourseList } from "@/components/path/PathCourseList";
import { PathHero } from "@/components/path/PathHero";
import { PathStats } from "@/components/path/PathStats";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getCourseBySlug } from "@/lib/content/course-registry";
import { getLessonsByCourse } from "@/lib/content/lesson-registry";
import { getAllPaths, getPathBySlug } from "@/lib/content/path-registry";
import { createCanonicalUrl, createMetadata } from "@/lib/seo/metadata";
import type { Course } from "@/types/course";
import type { LearningPath } from "@/types/path";

type PathDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function resolvePathCourses(path: LearningPath) {
  return path.courseSlugs
    .map((courseSlug) => {
      const course = getCourseBySlug(courseSlug);

      if (!course) {
        return undefined;
      }

      return {
        course,
        lessonCount: getLessonsByCourse(course.slug).length,
      };
    })
    .filter(
      (
        courseItem,
      ): courseItem is {
        course: Course;
        lessonCount: number;
      } => Boolean(courseItem),
    );
}

function getPathMetrics(path: LearningPath) {
  const courses = resolvePathCourses(path);

  return {
    totalCourses: courses.length,
    totalModules: courses.reduce(
      (total, courseItem) => total + courseItem.course.modules.length,
      0,
    ),
    totalLessons: courses.reduce((total, courseItem) => total + courseItem.lessonCount, 0),
    totalDurationHours: courses.reduce(
      (total, courseItem) => total + courseItem.course.estimatedHours,
      0,
    ),
    courses,
  };
}

export function generateStaticParams() {
  return getAllPaths().map((path) => ({
    slug: path.slug,
  }));
}

export async function generateMetadata({ params }: PathDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = getPathBySlug(slug);

  if (!path) {
    return {
      title: "Learning Path Not Found",
    };
  }

  return createMetadata({
    title: path.title,
    description: path.description,
    path: `/paths/${path.slug}`,
  });
}

export default async function PathDetailPage({ params }: PathDetailPageProps) {
  const { slug } = await params;
  const path = getPathBySlug(slug);

  if (!path) {
    notFound();
  }

  const metrics = getPathMetrics(path);
  const firstCourse = metrics.courses[0]?.course;

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: createCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Learning Paths",
        item: createCanonicalUrl("/paths"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: path.title,
        item: createCanonicalUrl(`/paths/${path.slug}`),
      },
    ],
  } as const;

  return (
    <>
      <JsonLd id={`path-${path.slug}-breadcrumb-jsonld`} data={breadcrumbStructuredData} />
      <Section className="py-10 sm:py-14 lg:py-16">
        <Container>
          <div className="space-y-8 lg:space-y-10">
            <PathHero
              eyebrow="Learning Path"
              title={path.title}
              description={path.description}
              level={path.level}
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Learning Paths", href: "/paths" },
                { label: path.title },
              ]}
              aside={
                <PathStats
                  totalCourses={metrics.totalCourses}
                  totalModules={metrics.totalModules}
                  totalLessons={metrics.totalLessons}
                  totalDurationHours={metrics.totalDurationHours}
                  ariaLabel={`${path.title} statistics`}
                />
              }
            />
            <PathCourseList courses={metrics.courses} />
            {firstCourse ? (
              <section
                aria-labelledby="path-start-learning-title"
                className="rounded-4xl border border-zinc-200 bg-zinc-950 px-8 py-8 text-zinc-50 shadow-[0_28px_80px_-56px_rgba(24,24,27,0.65)] sm:px-10"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Ready to begin
                    </p>
                    <h2
                      id="path-start-learning-title"
                      className="text-3xl font-semibold tracking-normal text-white"
                    >
                      Start Learning
                    </h2>
                    <p className="max-w-2xl text-base leading-7 text-zinc-300">
                      Begin this journey with {firstCourse.title} and move through the roadmap in
                      sequence.
                    </p>
                  </div>
                  <Link
                    href={`/courses/${firstCourse.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Start Learning
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </section>
            ) : null}
          </div>
        </Container>
      </Section>
    </>
  );
}
