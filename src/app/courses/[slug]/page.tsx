import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseHeader } from "@/components/course/CourseHeader";
import { ModuleList } from "@/components/course/ModuleList";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getAllCourses, getCourseBySlug } from "@/lib/content/course-registry";
import { getLessonsByCourse } from "@/lib/content/lesson-registry";
import { createCourseMetadata } from "@/lib/seo/metadata";
import { createCourseStructuredData } from "@/lib/seo/structured-data";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllCourses().map((course) => ({
    slug: course.slug,
  }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return createCourseMetadata(course);
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  const lessons = getLessonsByCourse(slug);

  if (!course) {
    notFound();
  }

  return (
    <>
      <JsonLd id={`course-${course.slug}-jsonld`} data={createCourseStructuredData(course)} />
      <Section>
        <Container>
          <div className="space-y-10">
            <CourseHeader course={course} lessonCount={lessons.length} />
            <ModuleList courseSlug={course.slug} lessons={lessons} modules={course.modules} />
          </div>
        </Container>
      </Section>
    </>
  );
}
