import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatLevelLabel } from "@/lib/content/filters";
import { courseUrl } from "@/lib/routes/route-builders";
import type { Course } from "@/types/course";

type CourseCardProps = {
  course: Course;
};

function formatCategoryLabel(category: Course["category"]) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function CourseCard({ course }: CourseCardProps) {
  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce(
    (total, courseModule) => total + courseModule.lessonSlugs.length,
    0,
  );
  const isPublished = course.status === "published";

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_30px_90px_-60px_rgba(29,78,216,0.55)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="primary">{formatLevelLabel(course.level)}</Badge>
        <Badge tone={isPublished ? "success" : "warning"}>{course.status}</Badge>
      </div>

      <div className="mt-6 flex-1 space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-accent-foreground">
            {formatCategoryLabel(course.category)}
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-foreground">
            <Link
              href={courseUrl(course.slug)}
              className="rounded-sm transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {course.title}
            </Link>
          </h2>
          <p className="text-base leading-7 text-muted-foreground">{course.subtitle}</p>
        </div>

        <dl className="grid grid-cols-3 gap-3 border-t border-border pt-5">
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
            <dd className="mt-2 text-lg font-semibold text-foreground">{totalLessons}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Hours
            </dt>
            <dd className="mt-2 text-lg font-semibold text-foreground">{course.estimatedHours}</dd>
          </div>
        </dl>

        {course.finalDeliverable ? (
          <p className="rounded-2xl border border-border bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">Final output:</span>{" "}
            {course.finalDeliverable}
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <Link
          href={courseUrl(course.slug)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full text-sm font-semibold text-primary transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Explore course
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </Card>
  );
}
