import Link from "next/link";

import type { Course } from "@/types/course";

type LessonSidebarProps = {
  course: Course;
  currentLessonSlug: string;
  className?: string;
};

type LessonSidebarContentProps = {
  course: Course;
  currentLessonSlug: string;
};

function LessonSidebarContent({ course, currentLessonSlug }: LessonSidebarContentProps) {
  const orderedModules = [...course.modules].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Course</p>
        <Link
          href={`/courses/${course.slug}`}
          className="block rounded-sm text-lg font-semibold text-zinc-950 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          {course.title}
        </Link>
      </div>
      <nav aria-label={`${course.title} outline`}>
        <ol className="space-y-6">
          {orderedModules.map((courseModule) => {
            const moduleLessons = [...courseModule.lessons].sort((a, b) => a.order - b.order);
            const isCurrentModule = moduleLessons.some(
              (lesson) => lesson.slug === currentLessonSlug,
            );

            return (
              <li key={courseModule.id} className="space-y-3">
                <div className="space-y-1">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${isCurrentModule ? "text-zinc-950" : "text-zinc-400"}`}
                  >
                    Module {courseModule.order}
                  </p>
                  <h2 className="text-sm font-semibold text-zinc-800">{courseModule.title}</h2>
                </div>
                {moduleLessons.length > 0 ? (
                  <ol className="space-y-2 border-l border-zinc-200 pl-4">
                    {moduleLessons.map((moduleLesson) => {
                      const isCurrentLesson = moduleLesson.slug === currentLessonSlug;

                      return (
                        <li key={moduleLesson.id}>
                          <Link
                            href={`/courses/${course.slug}/lessons/${moduleLesson.slug}`}
                            aria-current={isCurrentLesson ? "page" : undefined}
                            className={
                              isCurrentLesson
                                ? "block rounded-2xl border border-zinc-950 bg-zinc-950 px-3 py-3 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                                : "block rounded-2xl border border-transparent px-3 py-3 text-zinc-600 transition hover:border-zinc-200 hover:bg-white hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                            }
                          >
                            <span className="block text-sm font-semibold">
                              {moduleLesson.title}
                            </span>
                            <span
                              className={`mt-1 block text-xs ${isCurrentLesson ? "text-zinc-300" : "text-zinc-400"}`}
                            >
                              {moduleLesson.duration} min
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-2 text-sm text-zinc-500">
                    Lessons coming soon.
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

export function LessonSidebar({ course, currentLessonSlug, className }: LessonSidebarProps) {
  return (
    <div className={className}>
      <details className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-[0_24px_70px_-48px_rgba(24,24,27,0.35)] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl text-base font-semibold text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950">
          <span>Course outline</span>
          <span className="text-sm font-medium text-zinc-500">{course.modules.length} modules</span>
        </summary>
        <div className="mt-5 border-t border-zinc-200 pt-5">
          <LessonSidebarContent course={course} currentLessonSlug={currentLessonSlug} />
        </div>
      </details>
      <aside className="hidden lg:block lg:sticky lg:top-24" aria-labelledby="lesson-sidebar-title">
        <div className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50/80 p-6 shadow-[0_24px_70px_-48px_rgba(24,24,27,0.35)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2
              id="lesson-sidebar-title"
              className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500"
            >
              Course outline
            </h2>
            <span className="text-xs font-medium text-zinc-400">
              {course.modules.length} modules
            </span>
          </div>
          <LessonSidebarContent course={course} currentLessonSlug={currentLessonSlug} />
        </div>
      </aside>
    </div>
  );
}
