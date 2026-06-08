import { JsonLd } from "@/components/seo/JsonLd";
import { PathCard } from "@/components/path/PathCard";
import { PathHero } from "@/components/path/PathHero";
import { PathStats } from "@/components/path/PathStats";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getCourseBySlug } from "@/lib/content/course-registry";
import { getLessonsByCourseSlug } from "@/lib/content/lesson-registry";
import { getAllPaths } from "@/lib/content/path-registry";
import { createCanonicalUrl, createMetadata } from "@/lib/seo/metadata";
import type { Course } from "@/types/course";
import type { LearningPath } from "@/types/path";

export const metadata = createMetadata({
  title: "Learning Paths",
  description: "Explore guided learning journeys that connect courses into a clear sequence.",
  path: "/paths",
});

function resolvePathCourses(path: LearningPath): readonly Course[] {
  return path.courseSlugs
    .map((courseSlug) => getCourseBySlug(courseSlug))
    .filter((course): course is Course => Boolean(course));
}

function getPathMetrics(path: LearningPath) {
  const courses = resolvePathCourses(path);

  return {
    totalCourses: courses.length,
    totalModules: courses.reduce((total, course) => total + course.modules.length, 0),
    totalLessons: courses.reduce(
      (total, course) => total + getLessonsByCourseSlug(course.slug).length,
      0,
    ),
    totalDurationHours: courses.reduce((total, course) => total + course.estimatedHours, 0),
  };
}

function getCatalogMetrics(paths: readonly LearningPath[]) {
  const uniqueCourseSlugs = [...new Set(paths.flatMap((path) => path.courseSlugs))];
  const courses = uniqueCourseSlugs
    .map((courseSlug) => getCourseBySlug(courseSlug))
    .filter((course): course is Course => Boolean(course));

  return {
    totalCourses: courses.length,
    totalModules: courses.reduce((total, course) => total + course.modules.length, 0),
    totalLessons: courses.reduce(
      (total, course) => total + getLessonsByCourseSlug(course.slug).length,
      0,
    ),
    totalDurationHours: courses.reduce((total, course) => total + course.estimatedHours, 0),
  };
}

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
  ],
} as const;

export default function PathsPage() {
  const paths = getAllPaths();
  const catalogMetrics = getCatalogMetrics(paths);
  const pathCards = paths.map((path) => ({
    path,
    metrics: getPathMetrics(path),
  }));

  return (
    <>
      <JsonLd id="paths-breadcrumb-jsonld" data={breadcrumbStructuredData} />
      <Section className="py-10 sm:py-14 lg:py-16">
        <Container>
          <div className="space-y-8 lg:space-y-10">
            <PathHero
              eyebrow="Learning Paths"
              title="Learning Paths"
              description="Follow curated learning journeys that connect courses into a practical sequence you can navigate from start to finish."
              aside={
                <PathStats
                  totalCourses={catalogMetrics.totalCourses}
                  totalModules={catalogMetrics.totalModules}
                  totalLessons={catalogMetrics.totalLessons}
                  totalDurationHours={catalogMetrics.totalDurationHours}
                  ariaLabel="Learning paths catalog statistics"
                />
              }
            />
            <section aria-labelledby="paths-catalog-title">
              <h2 id="paths-catalog-title" className="sr-only">
                Learning paths catalog
              </h2>
              {pathCards.length > 0 ? (
                <div className="grid gap-6 xl:grid-cols-2">
                  {pathCards.map(({ path, metrics }) => (
                    <PathCard
                      key={path.id}
                      path={path}
                      courseCount={metrics.totalCourses}
                      totalLessons={metrics.totalLessons}
                      totalDurationHours={metrics.totalDurationHours}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-16 text-center shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:px-8">
                  <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                    No paths are available yet.
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted-foreground">
                    New guided sequences will appear here as the academy catalog grows.
                  </p>
                </div>
              )}
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}
