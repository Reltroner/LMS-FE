import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonPageClient } from "@/components/lesson/LessonPageClient";
import {
  getAllLessonRouteParams,
  getCourseModulesWithLessons,
  getLessonBySlug,
  getNextPreviousLesson,
} from "@/lib/content/lesson-registry";
import { createLessonMetadata } from "@/lib/seo/metadata";
import { getCourseBySlugOrAlias } from "@/lib/content/course-registry";

type LessonPageProps = {
  params: Promise<{
    slug: string;
    lesson: string;
  }>;
};

export const dynamic = "error";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessonRouteParams();
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, lesson: lessonSlug } = await params;
  const course = getCourseBySlugOrAlias(slug);
  const lesson = course ? getLessonBySlug(course.slug, lessonSlug) : undefined;

  if (!course || !lesson || lesson.courseSlug !== course.slug) {
    return {
      title: "Lesson Not Found",
    };
  }

  return createLessonMetadata({ course, lesson });
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lesson: lessonSlug } = await params;
  const course = getCourseBySlugOrAlias(slug);
  const lesson = course ? getLessonBySlug(course.slug, lessonSlug) : undefined;

  if (!course || !lesson || lesson.courseSlug !== course.slug) {
    notFound();
  }

  const modules = getCourseModulesWithLessons(course.slug);
  const { previousLesson, nextLesson } = getNextPreviousLesson(course.slug, lesson.slug);

  return (
    <LessonPageClient
      course={course}
      lesson={lesson}
      modules={modules}
      previousLesson={previousLesson}
      nextLesson={nextLesson}
    />
  );
}
