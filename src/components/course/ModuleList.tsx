import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { LessonDocument } from "@/lib/content/lesson-registry";
import { lessonUrl } from "@/lib/routes/route-builders";
import type { CourseModuleWithLessons } from "@/types/module";

type ModuleListProps = {
  courseSlug: string;
  modules: readonly CourseModuleWithLessons<LessonDocument>[];
};

function formatKindLabel(kind: string) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function ModuleList({ courseSlug, modules }: ModuleListProps) {
  const orderedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <section aria-labelledby="course-modules-title" className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <h2 id="course-modules-title" className="text-3xl font-semibold text-foreground">
          Course modules
        </h2>
        <p className="text-lg leading-8 text-muted-foreground">
          Work through each module in order, moving from concepts into practical checkpoints.
        </p>
      </div>
      <ol className="space-y-6">
        {orderedModules.map((courseModule) => {
          const orderedLessons = [...courseModule.lessons].sort(
            (leftLesson, rightLesson) => leftLesson.lessonOrder - rightLesson.lessonOrder,
          );

          return (
            <li key={courseModule.id}>
              <Card className="overflow-hidden">
                <div className="border-b border-border bg-primary/5 p-6 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <Badge tone="primary">Module {courseModule.order}</Badge>
                      <h3 className="text-2xl font-semibold text-foreground">
                        {courseModule.title}
                      </h3>
                      <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                        {courseModule.summary}
                      </p>
                    </div>
                    <p className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground">
                      {orderedLessons.length} lessons
                    </p>
                  </div>
                </div>
                <ol className="divide-y divide-border">
                  {orderedLessons.map((lesson) => (
                    <li key={lesson._id} className="p-5 transition hover:bg-primary/5 sm:p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge>Lesson {lesson.lessonOrder}</Badge>
                            <Badge tone="accent">{formatKindLabel(lesson.kind)}</Badge>
                            {lesson.status !== "published" ? (
                              <Badge tone="warning">{lesson.status}</Badge>
                            ) : null}
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">
                            <Link
                              href={lessonUrl(courseSlug, lesson.slug)}
                              className="rounded-sm transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                            >
                              {lesson.title}
                            </Link>
                          </h4>
                          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {lesson.summary}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-muted-foreground">
                          {lesson.durationLabel}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
