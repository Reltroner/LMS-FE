"use client";

import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseStats } from "@/components/course/CourseStats";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { createCollectionPageStructuredData } from "@/lib/seo/structured-data";
import type { Course } from "@/types/course";

type CoursesPageClientProps = {
  courses: readonly Course[];
  totalModules: number;
  totalLessons: number;
};

export function CoursesPageClient({ courses, totalModules, totalLessons }: CoursesPageClientProps) {
  return (
    <ProtectedRoute>
      <JsonLd id="courses-collection-jsonld" data={createCollectionPageStructuredData(courses)} />
      <Section className="py-10 sm:py-14 lg:py-16">
        <Container>
          <div className="space-y-8 lg:space-y-10">
            <section
              aria-labelledby="catalog-hero-title"
              className="overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_38%),linear-gradient(135deg,#ffffff,#f8fbff)] p-6 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10"
            >
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
                <div className="space-y-4">
                  <Badge tone="primary">Course Catalog</Badge>
                  <Heading level={1} className="max-w-3xl text-balance sm:text-6xl">
                    Courses
                  </Heading>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
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
    </ProtectedRoute>
  );
}

type CourseGridFallbackProps = {
  courses: readonly Course[];
};

function CourseGridFallback({ courses }: CourseGridFallbackProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Catalog controls
            </p>
            <h3 className="text-2xl font-semibold tracking-normal text-foreground">
              Explore courses
            </h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading catalog controls...</p>
        </div>
        <p className="text-sm text-muted-foreground">
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
