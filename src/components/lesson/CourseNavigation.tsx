import Link from "next/link";

import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import type { LessonDocument } from "@/lib/content/lesson-registry";

type CourseNavigationProps = {
  courseSlug: string;
  courseTitle: string;
  previousLesson?: LessonDocument;
  nextLesson?: LessonDocument;
};

export function CourseNavigation({
  courseSlug,
  courseTitle,
  previousLesson,
  nextLesson,
}: CourseNavigationProps) {
  return (
    <section
      aria-labelledby="course-navigation-title"
      className="space-y-5 rounded-[1.75rem] border border-zinc-200 bg-zinc-50/80 p-6 shadow-[0_24px_70px_-48px_rgba(24,24,27,0.35)] sm:p-8"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Learning navigation
        </p>
        <h2 id="course-navigation-title" className="text-2xl font-semibold text-zinc-950">
          Keep moving through the course
        </h2>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Jump back to the course outline or move directly between lessons without losing context.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <Link
          href={`/courses/${courseSlug}`}
          className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          <span className="text-sm font-medium text-zinc-500">Back to Course</span>
          <span className="mt-2 block text-lg font-semibold text-zinc-950">{courseTitle}</span>
          <span className="mt-3 block text-sm leading-6 text-zinc-600">
            Review the full outline and jump to any lesson from the course page.
          </span>
        </Link>
        <LessonNavigation
          className="lg:grid-cols-2"
          courseSlug={courseSlug}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </div>
    </section>
  );
}
