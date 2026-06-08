import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatLevelLabel } from "@/lib/content/filters";
import type { LessonDocument } from "@/lib/content/lesson-registry";
import { courseUrl } from "@/lib/routes/route-builders";

type LessonHeaderProps = {
  courseSlug: string;
  courseTitle: string;
  lesson: LessonDocument;
};

function formatKindLabel(kind: string) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function LessonHeader({ courseSlug, courseTitle, lesson }: LessonHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_40%),linear-gradient(135deg,#ffffff,#f8fbff)] p-6 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10">
      <nav aria-label="Breadcrumb" className="text-sm font-medium text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/courses"
              className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Courses
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/60">
            /
          </li>
          <li>
            <Link
              href={courseUrl(courseSlug)}
              className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {courseTitle}
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/60">
            /
          </li>
          <li className="text-foreground">{lesson.title}</li>
        </ol>
      </nav>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Badge tone="primary">{lesson.moduleTitle}</Badge>
            <Badge tone="accent">{formatKindLabel(lesson.kind)}</Badge>
            <Badge>{formatLevelLabel(lesson.level)}</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              {lesson.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{lesson.summary}</p>
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            ["Duration", lesson.durationLabel],
            ["Kind", formatKindLabel(lesson.kind)],
            ["Level", formatLevelLabel(lesson.level)],
            ["Status", lesson.status],
          ].map(([label, value]) => (
            <Card key={label} className="p-4 shadow-none">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</dd>
            </Card>
          ))}
        </dl>
      </div>
    </header>
  );
}
