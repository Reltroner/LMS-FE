import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseNavigation } from "@/components/lesson/CourseNavigation";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getCourseBySlugOrAlias } from "@/lib/content/course-registry";
import {
  getAllLessonRouteParams,
  getCourseModulesWithLessons,
  getLessonBySlug,
  getNextPreviousLesson,
} from "@/lib/content/lesson-registry";
import { createLessonMetadata } from "@/lib/seo/metadata";
import { createLessonStructuredData } from "@/lib/seo/structured-data";

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
    <>
      <JsonLd
        id={`lesson-${lesson.slug}-jsonld`}
        data={createLessonStructuredData({ course, lesson })}
      />
      <Section className="py-10 sm:py-14 lg:py-16">
        <Container className="max-w-7xl">
          <div className="space-y-8 lg:space-y-10">
            <LessonHeader courseSlug={course.slug} courseTitle={course.title} lesson={lesson} />
            <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[20rem_minmax(0,1fr)]">
              <div className="space-y-8 lg:col-start-2 lg:row-start-1">
                <LessonContent code={lesson.body.code} />
                <CourseNavigation
                  courseSlug={course.slug}
                  courseTitle={course.title}
                  previousLesson={previousLesson}
                  nextLesson={nextLesson}
                />
              </div>
              <LessonSidebar
                className="lg:col-start-1 lg:row-start-1"
                course={course}
                modules={modules}
                currentLessonSlug={lesson.slug}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
