import { formatLevelLabel } from "@/lib/content/filters";
import type { Course } from "@/types/course";

type CourseHeaderProps = {
  course: Course;
  lessonCount?: number;
};

export function CourseHeader({ course, lessonCount }: CourseHeaderProps) {
  const totalLessons =
    lessonCount ??
    course.modules.reduce((total, courseModule) => total + courseModule.lessonSlugs.length, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-500">{formatLevelLabel(course.level)}</p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
          {course.title}
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-zinc-600">{course.subtitle}</p>
      </div>
      <dl className="grid gap-4 border-y border-zinc-200 py-5 sm:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-zinc-500">Duration</dt>
          <dd className="mt-1 text-base font-semibold text-zinc-950">
            {course.estimatedHours} hours
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500">Modules</dt>
          <dd className="mt-1 text-base font-semibold text-zinc-950">{course.modules.length}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500">Lessons</dt>
          <dd className="mt-1 text-base font-semibold text-zinc-950">{totalLessons}</dd>
        </div>
      </dl>
    </div>
  );
}
