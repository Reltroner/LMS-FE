import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailPageClient } from "@/components/course/CourseDetailPageClient";
import {
  getAllCourses,
  getCourseBySlugOrAlias,
  getCourseRouteSlugs,
} from "@/lib/content/course-registry";
import { getCourseModulesWithLessons, getLessonsByCourseSlug } from "@/lib/content/lesson-registry";
import { createCourseMetadata } from "@/lib/seo/metadata";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "error";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCourses().flatMap((course) =>
    getCourseRouteSlugs(course).map((slug) => ({
      slug,
    })),
  );
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlugOrAlias(slug);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return createCourseMetadata(course);
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlugOrAlias(slug);

  if (!course) {
    notFound();
  }

  const lessons = getLessonsByCourseSlug(course.slug);
  const modules = getCourseModulesWithLessons(course.slug);

  return <CourseDetailPageClient course={course} lessons={lessons} modules={modules} />;
}
