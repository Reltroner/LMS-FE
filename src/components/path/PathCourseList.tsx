import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { courseUrl } from "@/lib/routes/route-builders";
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
          className="text-3xl font-semibold tracking-normal text-foreground"
        >
          Learning roadmap
        </h2>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
          Move through the included courses in order, then continue into the next milestones as the
          curriculum expands.
        </p>
      </div>
      <ol className="space-y-6" aria-label="Learning path roadmap">
        {courses.map((courseItem, index) => {
          const hasConnector = index < courses.length - 1 || courses.length > 0;
          const totalModules = courseItem.course.modules.length;

          return (
            <li key={courseItem.course.id} className="relative pl-12 sm:pl-16">
              {hasConnector ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.15rem] top-12 h-[calc(100%+1.5rem)] w-px bg-border"
                />
              ) : null}
              <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-card text-sm font-semibold text-primary shadow-sm">
                {index + 1}
              </span>
              <article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <Badge tone="primary">Stage {index + 1}</Badge>
                    <h3 className="text-2xl font-semibold text-foreground">
                      <Link
                        href={courseUrl(courseItem.course.slug)}
                        className="rounded-sm transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                      >
                        {courseItem.course.title}
                      </Link>
                    </h3>
                    <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                      {courseItem.course.subtitle}
                    </p>
                  </div>
                  <dl className="grid grid-cols-3 gap-3 sm:min-w-[20rem]">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Modules
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-foreground">{totalModules}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Lessons
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-foreground">
                        {courseItem.lessonCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Duration
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-foreground">
                        {courseItem.course.estimatedHours}h
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-6">
                  <Link
                    href={courseUrl(courseItem.course.slug)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full text-sm font-semibold text-primary transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    View course
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
        <li className="relative pl-12 sm:pl-16">
          <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-primary/30 bg-primary/5 text-sm font-semibold text-primary">
            +
          </span>
          <article className="rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Coming next
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">
              Future Courses Placeholder
            </h3>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Additional milestones will appear here as new courses become available in this path.
            </p>
          </article>
        </li>
      </ol>
    </section>
  );
}
