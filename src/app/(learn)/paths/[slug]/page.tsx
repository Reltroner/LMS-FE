import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PathDetailPageClient } from "@/components/path/PathDetailPageClient";
import { pathUrl } from "@/lib/routes/route-builders";
import { createCanonicalUrl, createMetadata } from "@/lib/seo/metadata";
import { getCourseBySlug } from "@/lib/content/course-registry";
import { getLessonsByCourseSlug } from "@/lib/content/lesson-registry";
import { getAllPaths, getPathBySlug } from "@/lib/content/path-registry";
import type { Course } from "@/types/course";
import type { LearningPath } from "@/types/path";

type PathDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "error";
export const dynamicParams = false;

function resolvePathCourses(path: LearningPath) {
  return path.courseSlugs
    .map((courseSlug) => {
      const course = getCourseBySlug(courseSlug);

      if (!course) {
        return undefined;
      }

      return {
        course,
        lessonCount: getLessonsByCourseSlug(course.slug).length,
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
    description: path.summary,
    path: pathUrl(path.slug),
  });
}

export default async function PathDetailPage({ params }: PathDetailPageProps) {
  const { slug } = await params;
  const path = getPathBySlug(slug);

  if (!path) {
    notFound();
  }

  const metrics = getPathMetrics(path);

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
        item: createCanonicalUrl(pathUrl(path.slug)),
      },
    ],
  } as const;

  return (
    <PathDetailPageClient
      path={path}
      metrics={metrics}
      breadcrumbStructuredData={breadcrumbStructuredData}
    />
  );
}
