import Link from "next/link";

import { formatLevelLabel } from "@/lib/content/filters";
import { courseUrl } from "@/lib/routes/route-builders";
import type { Course } from "@/types/course";

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce(
    (total, courseModule) => total + courseModule.lessonSlugs.length,
    0,
  );

  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_-48px_rgba(24,24,27,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
          {formatLevelLabel(course.level)}
        </p>
        <p className="text-sm font-medium text-zinc-500">{course.estimatedHours} hours</p>
      </div>
      <div className="mt-6 flex-1 space-y-4">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-zinc-950">
            <Link
              href={courseUrl(course.slug)}
              className="rounded-sm transition hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              {course.title}
            </Link>
          </h2>
          <p className="text-base leading-7 text-zinc-600">{course.subtitle}</p>
        </div>
        <dl className="grid grid-cols-3 gap-3 border-t border-zinc-200 pt-5">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Modules
            </dt>
            <dd className="mt-2 text-lg font-semibold text-zinc-950">{totalModules}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Lessons
            </dt>
            <dd className="mt-2 text-lg font-semibold text-zinc-950">{totalLessons}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Duration
            </dt>
            <dd className="mt-2 text-lg font-semibold text-zinc-950">{course.estimatedHours}h</dd>
          </div>
        </dl>
      </div>
      <div className="mt-6">
        <Link
          href={courseUrl(course.slug)}
          className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-zinc-950 transition hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          Explore course
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
