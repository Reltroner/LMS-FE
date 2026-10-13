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

function BookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}

function LayersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5" />
      <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function CourseCard({ course }: CourseCardProps) {
  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce(
    (total, courseModule) => total + courseModule.lessonSlugs.length,
    0,
  );
  const isPublished = course.status === "published";

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_30px_90px_-50px_rgba(29,78,216,0.55)]">
      {/* Decorative brand header banner */}
      <div className="relative flex h-28 items-center justify-center border-b border-border/70 bg-gradient-to-br from-primary/12 via-accent/8 to-transparent">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-card/85 text-primary shadow-xs backdrop-blur">
          <BookIcon className="h-6 w-6" />
        </span>
        <div className="absolute left-4 top-3.5">
          <Badge tone="primary">{formatCategoryLabel(course.category)}</Badge>
        </div>
        <div className="absolute right-4 top-3.5">
          <Badge tone={isPublished ? "success" : "warning"}>{course.status}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{formatLevelLabel(course.level)}</Badge>
        </div>

        <div className="mt-4 flex-1 space-y-3">
          <h2 className="text-xl font-bold leading-snug text-foreground">
            <Link
              href={courseUrl(course.slug)}
              className="rounded-sm transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {course.title}
            </Link>
          </h2>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{course.subtitle}</p>

          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <LayersIcon className="h-4 w-4 shrink-0 text-primary/70" />
              <dt className="sr-only">Modules</dt>
              <dd className="font-medium text-foreground">{totalModules} mod</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <BookIcon className="h-4 w-4 shrink-0 text-primary/70" />
              <dt className="sr-only">Lessons</dt>
              <dd className="font-medium text-foreground">{totalLessons} les</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 shrink-0 text-primary/70" />
              <dt className="sr-only">Hours</dt>
              <dd className="font-medium text-foreground">{course.estimatedHours}h</dd>
            </div>
          </dl>

          {course.finalDeliverable ? (
            <p className="rounded-xl border border-border/80 bg-primary/5 px-3.5 py-2.5 text-xs leading-5 text-muted-foreground">
              <span className="font-semibold text-foreground">Final output:</span>{" "}
              {course.finalDeliverable}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
          <span className="text-[11px] font-medium text-muted-foreground">
            {totalLessons > 0 ? `${totalLessons} lessons ready` : "Syllabus ready"}
          </span>
          <Link
            href={courseUrl(course.slug)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full text-sm font-semibold text-primary transition hover:gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Explore course
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
