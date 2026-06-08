import Link from "next/link";

import type { LessonDocument } from "@/lib/content/lesson-registry";
import { lessonUrl } from "@/lib/routes/route-builders";

type LessonNavigationProps = {
  courseSlug: string;
  previousLesson?: LessonDocument;
  nextLesson?: LessonDocument;
  className?: string;
};

export function LessonNavigation({
  courseSlug,
  previousLesson,
  nextLesson,
  className,
}: LessonNavigationProps) {
  return (
    <nav aria-label="Lesson navigation" className={`grid gap-4 ${className ?? ""}`}>
      <LessonNavigationLink direction="Previous" courseSlug={courseSlug} lesson={previousLesson} />
      <LessonNavigationLink direction="Next" courseSlug={courseSlug} lesson={nextLesson} />
    </nav>
  );
}

type LessonNavigationLinkProps = {
  direction: "Previous" | "Next";
  courseSlug: string;
  lesson?: LessonDocument;
};

function LessonNavigationLink({ direction, courseSlug, lesson }: LessonNavigationLinkProps) {
  if (!lesson) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/70 px-5 py-6 text-sm font-medium text-muted-foreground">
        No {direction.toLowerCase()} lesson
      </div>
    );
  }

  return (
    <Link
      href={lessonUrl(courseSlug, lesson.slug)}
      className="rounded-2xl border border-border bg-white px-5 py-6 transition hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <span className="text-sm font-medium text-muted-foreground">{direction}</span>
      <span className="mt-2 block text-base font-semibold text-foreground">{lesson.title}</span>
      <span className="mt-3 block text-sm leading-6 text-muted-foreground">{lesson.summary}</span>
    </Link>
  );
}
