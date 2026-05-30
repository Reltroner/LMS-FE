import Link from "next/link";

import type { Course } from "@/types/course";

type PathCourseListItem = Readonly<{
  course: Course;
  lessonCount: number;
}>;

type PathCourseListProps = {
  courses: readonly PathCourseListItem[];
};

export function PathCourseList({ courses }: PathCourseListProps) {
  return (
    <section aria-labelledby="path-roadmap-title" className="space-y-6">
      <div className="space-y-3">
        <h2
          id="path-roadmap-title"
          className="text-3xl font-semibold tracking-normal text-zinc-950"
        >
          Learning roadmap
        </h2>
        <p className="max-w-3xl text-lg leading-8 text-zinc-600">
          Move through the included courses in order, then continue into the next milestones as the
          curriculum expands.
        </p>
      </div>
      <ol className="space-y-6" aria-label="Learning path roadmap">
        {courses.map((courseItem, index) => {
          const hasConnector = index < courses.length - 1 || courses.length > 0;
          const totalModules = courseItem.course.modules.length;

          return (
            <li key={courseItem.course.id} className="relative pl-16">
              {hasConnector ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.15rem] top-12 h-[calc(100%+1.5rem)] w-px bg-zinc-200"
                />
              ) : null}
              <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-950 shadow-sm">
                {index + 1}
              </span>
              <article className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_-48px_rgba(24,24,27,0.22)] sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Stage {index + 1}
                    </p>
                    <h3 className="text-2xl font-semibold text-zinc-950">
                      <Link
                        href={`/courses/${courseItem.course.slug}`}
                        className="rounded-sm transition hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                      >
                        {courseItem.course.title}
                      </Link>
                    </h3>
                    <p className="max-w-3xl text-base leading-7 text-zinc-600">
                      {courseItem.course.description}
                    </p>
                  </div>
                  <dl className="grid grid-cols-3 gap-4 sm:min-w-[20rem]">
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
                      <dd className="mt-2 text-lg font-semibold text-zinc-950">
                        {courseItem.lessonCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Duration
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-zinc-950">
                        {courseItem.course.estimatedHours}h
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-6">
                  <Link
                    href={`/courses/${courseItem.course.slug}`}
                    className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-zinc-950 transition hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                  >
                    View course
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
        <li className="relative pl-16">
          <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-zinc-50 text-sm font-semibold text-zinc-500">
            +
          </span>
          <article className="rounded-[1.75rem] border border-dashed border-zinc-300 bg-zinc-50/80 p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Coming next
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-zinc-950">
              Future Courses Placeholder
            </h3>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
              Additional backend engineering milestones will appear here as new courses become
              available in this path.
            </p>
          </article>
        </li>
      </ol>
    </section>
  );
}
