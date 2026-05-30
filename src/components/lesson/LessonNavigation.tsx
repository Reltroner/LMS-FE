import Link from "next/link";

import type { LessonDocument } from "@/lib/content/lesson-registry";

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
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-6 text-sm font-medium text-zinc-400">
        No {direction.toLowerCase()} lesson
      </div>
    );
  }

  return (
    <Link
      href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
      className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
    >
      <span className="text-sm font-medium text-zinc-500">{direction}</span>
      <span className="mt-2 block text-base font-semibold text-zinc-950">{lesson.title}</span>
      <span className="mt-3 block text-sm leading-6 text-zinc-600">{lesson.description}</span>
    </Link>
  );
}
