import { PathsPageClient } from "@/components/path/PathsPageClient";
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
    <PathsPageClient
      pathCards={pathCards}
      catalogMetrics={catalogMetrics}
      breadcrumbStructuredData={breadcrumbStructuredData}
    />
  );
}
