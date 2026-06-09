"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CourseNavigation } from "@/components/lesson/CourseNavigation";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createLessonStructuredData } from "@/lib/seo/structured-data";
import type { Course } from "@/types/course";
import type {
  LessonDocument,
  CourseModuleWithLessonDocuments,
} from "@/lib/content/lesson-registry";

type LessonPageClientProps = {
  course: Course;
  lesson: LessonDocument;
  modules: readonly CourseModuleWithLessonDocuments[];
  previousLesson: LessonDocument | undefined;
  nextLesson: LessonDocument | undefined;
};

export function LessonPageClient({
  course,
  lesson,
  modules,
  previousLesson,
  nextLesson,
}: LessonPageClientProps) {
  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
