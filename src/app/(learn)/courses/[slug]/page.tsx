import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseHeader } from "@/components/course/CourseHeader";
import { ModuleList } from "@/components/course/ModuleList";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  getAllCourses,
  getCourseBySlugOrAlias,
  getCourseRouteSlugs,
} from "@/lib/content/course-registry";
import { getCourseModulesWithLessons, getLessonsByCourseSlug } from "@/lib/content/lesson-registry";
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

  return (
    <>
      <JsonLd id={`course-${course.slug}-jsonld`} data={createCourseStructuredData(course)} />
      <Section>
        <Container>
          <div className="space-y-10">
            <CourseHeader course={course} lessonCount={lessons.length} />
            <ModuleList courseSlug={course.slug} modules={modules} />
          </div>
        </Container>
      </Section>
    </>
  );
}
