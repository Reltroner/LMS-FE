import Link from "next/link";

import type { LessonDocument } from "@/lib/content/lesson-registry";
import { lessonUrl } from "@/lib/routes/route-builders";
import type { CourseModuleWithLessons } from "@/types/module";

type ModuleListProps = {
  courseSlug: string;
  modules: readonly CourseModuleWithLessons<LessonDocument>[];
};

export function ModuleList({ courseSlug, modules }: ModuleListProps) {
  const orderedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <ol className="space-y-5">
      {orderedModules.map((courseModule) => {
        const orderedLessons = [...courseModule.lessons].sort(
          (leftLesson, rightLesson) => leftLesson.lessonOrder - rightLesson.lessonOrder,
        );

        return (
          <li key={courseModule.id} className="border border-zinc-200 bg-white p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-500">Module {courseModule.order}</p>
                <h2 className="text-2xl font-semibold text-zinc-950">{courseModule.title}</h2>
                <p className="text-base leading-7 text-zinc-600">{courseModule.summary}</p>
                <p className="text-sm font-medium text-zinc-500">{orderedLessons.length} lessons</p>
              </div>
              <ol className="divide-y divide-zinc-200 border-t border-zinc-200">
                {orderedLessons.map((lesson) => (
                  <li key={lesson._id} className="py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-500">
                          Lesson {lesson.lessonOrder}
                        </p>
                        <h3 className="text-lg font-semibold text-zinc-950">
                          <Link
                            href={lessonUrl(courseSlug, lesson.slug)}
                            className="hover:text-zinc-700"
                          >
                            {lesson.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-zinc-600">{lesson.summary}</p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-zinc-500">
                        {lesson.durationLabel}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
