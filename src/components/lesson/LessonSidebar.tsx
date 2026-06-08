import Link from "next/link";

import type { LessonDocument } from "@/lib/content/lesson-registry";
import { courseUrl, lessonUrl } from "@/lib/routes/route-builders";
import type { Course } from "@/types/course";
import type { CourseModuleWithLessons } from "@/types/module";

type LessonSidebarProps = {
  course: Course;
  modules: readonly CourseModuleWithLessons<LessonDocument>[];
  currentLessonSlug: string;
  className?: string;
};

type LessonSidebarContentProps = {
  course: Course;
  modules: readonly CourseModuleWithLessons<LessonDocument>[];
  currentLessonSlug: string;
};

function LessonSidebarContent({ course, modules, currentLessonSlug }: LessonSidebarContentProps) {
  const orderedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Course
        </p>
        <Link
          href={courseUrl(course.slug)}
          className="block rounded-sm text-lg font-semibold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {course.title}
        </Link>
      </div>
      <nav aria-label={`${course.title} outline`}>
        <ol className="space-y-6">
          {orderedModules.map((courseModule) => {
            const moduleLessons = [...courseModule.lessons].sort(
              (a, b) => a.lessonOrder - b.lessonOrder,
            );
            const isCurrentModule = moduleLessons.some(
              (lesson) => lesson.slug === currentLessonSlug,
            );

            return (
              <li key={courseModule.id} className="space-y-3">
                <div className="space-y-1">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${isCurrentModule ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Module {courseModule.order}
                  </p>
                  <h2 className="text-sm font-semibold text-foreground">{courseModule.title}</h2>
                </div>
                {moduleLessons.length > 0 ? (
                  <ol className="space-y-2 border-l border-border pl-4">
                    {moduleLessons.map((moduleLesson) => {
                      const isCurrentLesson = moduleLesson.slug === currentLessonSlug;

                      return (
                        <li key={moduleLesson._id}>
                          <Link
                            href={lessonUrl(course.slug, moduleLesson.slug)}
                            aria-current={isCurrentLesson ? "page" : undefined}
                            className={
                              isCurrentLesson
                                ? "block rounded-2xl border border-primary bg-primary px-3 py-3 text-primary-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                                : "block rounded-2xl border border-transparent px-3 py-3 text-muted-foreground transition hover:border-border hover:bg-card hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                            }
                          >
                            <span className="block text-sm font-semibold">
                              {moduleLesson.title}
                            </span>
                            <span
                              className={`mt-1 block text-xs ${isCurrentLesson ? "text-blue-100" : "text-muted-foreground"}`}
                            >
                              {moduleLesson.durationLabel}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
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

export function LessonSidebar({
  course,
  modules,
  currentLessonSlug,
  className,
}: LessonSidebarProps) {
  return (
    <div className={className}>
      <details className="rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span>Course outline</span>
          <span className="text-sm font-medium text-muted-foreground">
            {course.modules.length} modules
          </span>
        </summary>
        <div className="mt-5 border-t border-border pt-5">
          <LessonSidebarContent
            course={course}
            modules={modules}
            currentLessonSlug={currentLessonSlug}
          />
        </div>
      </details>
      <aside className="hidden lg:block lg:sticky lg:top-24" aria-labelledby="lesson-sidebar-title">
        <div className="rounded-[1.75rem] border border-border bg-white/84 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2
              id="lesson-sidebar-title"
              className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Course outline
            </h2>
            <span className="text-xs font-medium text-muted-foreground">
              {course.modules.length} modules
            </span>
          </div>
          <LessonSidebarContent
            course={course}
            modules={modules}
            currentLessonSlug={currentLessonSlug}
          />
        </div>
      </aside>
    </div>
  );
}
