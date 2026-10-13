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

function CompassIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function BookIcon({ className = "h-4 w-4" }: { className?: string }) {
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

export function PathCard({ path, courseCount, totalLessons, totalDurationHours }: PathCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_30px_90px_-50px_rgba(6,182,212,0.45)]">
      {/* Decorative accent banner */}
      <div className="flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-accent/12 via-primary/6 to-transparent px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/90 text-accent-foreground shadow-xs">
            <CompassIcon className="h-5 w-5" />
          </span>
          <Badge tone="accent">Learning path</Badge>
        </div>
        <Badge tone={path.status === "published" ? "success" : "warning"}>{path.status}</Badge>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{formatLevelLabel(path.level)}</Badge>
        </div>

        <div className="mt-4 flex-1 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold leading-snug text-foreground">
              <Link
                href={pathUrl(path.slug)}
                className="rounded-sm transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {path.title}
              </Link>
            </h2>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{path.subtitle}</p>
          </div>

          <dl className="grid grid-cols-3 gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CompassIcon className="h-4 w-4 shrink-0 text-accent-foreground/80" />
              <dd className="font-medium text-foreground">{courseCount} courses</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <BookIcon className="h-4 w-4 shrink-0 text-accent-foreground/80" />
              <dd className="font-medium text-foreground">{totalLessons} lessons</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 shrink-0 text-accent-foreground/80" />
              <dd className="font-medium text-foreground">~{totalDurationHours}h</dd>
            </div>
          </dl>

          <p className="rounded-2xl border border-border/80 bg-accent/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {path.summary}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
          <span className="text-[11px] font-medium text-muted-foreground">
            Curriculum sequence ({courseCount} courses)
          </span>
          <Link
            href={pathUrl(path.slug)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full text-sm font-semibold text-primary transition hover:gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Explore path
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
