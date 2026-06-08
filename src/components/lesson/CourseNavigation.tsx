import Link from "next/link";

import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import type { LessonDocument } from "@/lib/content/lesson-registry";
import { courseUrl } from "@/lib/routes/route-builders";

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
      className="space-y-5 rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] sm:p-8"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Learning navigation
        </p>
        <h2 id="course-navigation-title" className="text-2xl font-semibold text-foreground">
          Keep moving through the course
        </h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Jump back to the course outline or move directly between lessons without losing context.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <Link
          href={courseUrl(courseSlug)}
          className="rounded-2xl border border-border bg-primary/5 px-5 py-6 transition hover:border-primary/30 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="text-sm font-medium text-muted-foreground">Back to Course</span>
          <span className="mt-2 block text-lg font-semibold text-foreground">{courseTitle}</span>
          <span className="mt-3 block text-sm leading-6 text-muted-foreground">
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
