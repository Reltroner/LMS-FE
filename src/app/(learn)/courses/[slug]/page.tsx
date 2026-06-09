import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseHeader } from "@/components/course/CourseHeader";
import { ModuleList } from "@/components/course/ModuleList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  getAllCourses,
  getCourseBySlugOrAlias,
  getCourseRouteSlugs,
} from "@/lib/content/course-registry";
import { getCourseModulesWithLessons, getLessonsByCourseSlug } from "@/lib/content/lesson-registry";
import { lessonUrl } from "@/lib/routes/route-builders";
import { createCourseMetadata } from "@/lib/seo/metadata";
import { createCourseStructuredData } from "@/lib/seo/structured-data";

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
  const firstLesson = lessons[0];

  return (
    <ProtectedRoute>
      <JsonLd id={`course-${course.slug}-jsonld`} data={createCourseStructuredData(course)} />
      <Section>
        <Container>
          <div className="space-y-10">
            <CourseHeader course={course} lessonCount={lessons.length} />
            {firstLesson ? (
              <section
                aria-labelledby="course-start-title"
                className="rounded-[1.75rem] border border-border bg-slate-950 p-6 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] sm:p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
                      Ready when you are
                    </p>
                    <h2 id="course-start-title" className="text-2xl font-semibold">
                      Start with {firstLesson.title}
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300">
                      Begin at the first lesson, then move through each module in sequence.
                    </p>
                  </div>
                  <ButtonLink
                    href={lessonUrl(course.slug, firstLesson.slug)}
                    variant="secondary"
                    className="border-white/20 bg-white text-slate-950 hover:bg-blue-50"
                  >
                    Start first lesson
                  </ButtonLink>
                </div>
              </section>
            ) : null}
            <ModuleList courseSlug={course.slug} modules={modules} />
          </div>
        </Container>
      </Section>
    </ProtectedRoute>
  );
}
