import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatLevelLabel } from "@/lib/content/filters";
import { pathUrl } from "@/lib/routes/route-builders";
import type { LearningPath } from "@/types/path";

type PathCardProps = {
  path: LearningPath;
  courseCount: number;
  totalLessons: number;
  totalDurationHours: number;
};

export function PathCard({ path, courseCount, totalLessons, totalDurationHours }: PathCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_30px_90px_-60px_rgba(29,78,216,0.55)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="accent">{formatLevelLabel(path.level)}</Badge>
        <Badge tone={path.status === "published" ? "success" : "warning"}>{path.status}</Badge>
      </div>
      <div className="mt-6 flex-1 space-y-5">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold leading-tight text-foreground">
            <Link
              href={pathUrl(path.slug)}
              className="rounded-sm transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {path.title}
            </Link>
          </h2>
          <p className="text-base leading-7 text-muted-foreground">{path.subtitle}</p>
        </div>
        <dl className="grid grid-cols-3 gap-3 border-t border-border pt-5">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Courses
            </dt>
            <dd className="mt-2 text-lg font-semibold text-foreground">{courseCount}</dd>
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
            <dd className="mt-2 text-lg font-semibold text-foreground">{totalDurationHours}</dd>
          </div>
        </dl>
        <p className="rounded-2xl border border-border bg-accent/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {path.summary}
        </p>
      </div>
      <div className="mt-6">
        <Link
          href={pathUrl(path.slug)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full text-sm font-semibold text-primary transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Explore path
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </Card>
  );
}
