import { Suspense } from "react";

import { CourseCard } from "@/components/course/CourseCard";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseStats } from "@/components/course/CourseStats";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { getAllCourses } from "@/lib/content/course-registry";
import { createMetadata } from "@/lib/seo/metadata";
import { createCollectionPageStructuredData } from "@/lib/seo/structured-data";
import type { Course } from "@/types/course";

export const metadata = createMetadata({
  title: "Courses",
  description: "Browse engineering, AI, and project-based learning courses.",
  path: "/courses",
});

export default function CoursesPage() {
  const courses = getAllCourses();
  const totalModules = courses.reduce((total, course) => total + course.modules.length, 0);
  const totalLessons = courses.reduce(
    (total, course) =>
      total +
      course.modules.reduce(
        (courseTotal, courseModule) => courseTotal + courseModule.lessons.length,
        0,
      ),
    0,
  );

  return (
    <>
      <JsonLd id="courses-collection-jsonld" data={createCollectionPageStructuredData(courses)} />
      <Section className="py-10 sm:py-14 lg:py-16">
        <Container>
          <div className="space-y-8 lg:space-y-10">
            <section
              aria-labelledby="catalog-hero-title"
              className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(244,244,245,0.95),rgba(255,255,255,1)_40%,rgba(250,250,250,1)_72%)] p-8 shadow-[0_32px_90px_-56px_rgba(24,24,27,0.45)] sm:p-10 lg:p-12"
            >
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Course Catalog
                  </p>
                  <Heading level={1} className="max-w-3xl text-balance sm:text-6xl">
                    Courses
                  </Heading>
                  <p className="max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
                    Learn engineering, AI, and project-based skills through structured learning
                    paths.
                  </p>
                </div>
                <CourseStats
                  totalCourses={courses.length}
                  totalModules={totalModules}
                  totalLessons={totalLessons}
                />
              </div>
            </section>
            <section aria-labelledby="catalog-results-title">
              <h2 id="catalog-results-title" className="sr-only">
                Course catalog results
              </h2>
              <Suspense fallback={<CourseGridFallback courses={courses} />}>
                <CourseGrid courses={courses} />
              </Suspense>
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}

type CourseGridFallbackProps = {
  courses: readonly Course[];
};

function CourseGridFallback({ courses }: CourseGridFallbackProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Catalog controls
            </p>
            <h3 className="text-2xl font-semibold tracking-normal text-zinc-950">
              Explore courses
            </h3>
          </div>
          <p className="text-sm font-medium text-zinc-500">Loading catalog controls...</p>
        </div>
        <p className="text-sm text-zinc-500">
          Showing {courses.length} of {courses.length} courses.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
