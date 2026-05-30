import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseNavigation } from "@/components/lesson/CourseNavigation";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getCourseBySlug } from "@/lib/content/course-registry";
import { getAllLessons, getLessonBySlug, getLessonsByCourse } from "@/lib/content/lesson-registry";
import { createLessonMetadata } from "@/lib/seo/metadata";
import { createLessonStructuredData } from "@/lib/seo/structured-data";

type LessonPageProps = {
  params: Promise<{
    slug: string;
    lesson: string;
  }>;
};

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({
    slug: lesson.course,
    lesson: lesson.slug,
  }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, lesson: lessonSlug } = await params;
  const course = getCourseBySlug(slug);
  const lesson = getLessonBySlug(lessonSlug);

  if (!course || !lesson || lesson.course !== slug) {
    return {
      title: "Lesson Not Found",
    };
  }

  return createLessonMetadata({ course, lesson });
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lesson: lessonSlug } = await params;
  const course = getCourseBySlug(slug);
  const lesson = getLessonBySlug(lessonSlug);

  if (!course || !lesson || lesson.course !== course.slug) {
    notFound();
  }

  const lessons = getLessonsByCourse(course.slug);
  const currentLessonIndex = lessons.findIndex((courseLesson) => courseLesson.slug === lesson.slug);

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
                  previousLesson={lessons[currentLessonIndex - 1]}
                  nextLesson={lessons[currentLessonIndex + 1]}
                />
              </div>
              <LessonSidebar
                className="lg:col-start-1 lg:row-start-1"
                course={course}
                currentLessonSlug={lesson.slug}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
