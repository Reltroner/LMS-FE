import Link from "next/link";
import type { LearningPath } from "@/types/path";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CompassIcon, ClockIcon, ArrowRightIcon } from "@/components/ui/icons";
import { getCourseBySlug } from "@/lib/fixtures/courses";

export function PathCard({ path }: { path: LearningPath }) {
  const courses = path.courseSlugs
    .map((slug) => getCourseBySlug(slug))
    .filter(Boolean);

  return (
    <Card as="article" interactive className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-background-elevated/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CompassIcon width={20} height={20} />
          </span>
          <Badge tone="accent">Learning path</Badge>
        </div>
        <Badge tone={path.status === "published" ? "success" : "warning"}>
          {path.status}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold text-foreground">
          <Link
            href={`/paths/${path.slug}`}
            className="hover:text-primary"
          >
            {path.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {path.summary}
        </p>

        <div className="mt-5 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Curriculum Sequence ({courses.length} courses)
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {courses.slice(0, 3).map((c, i) => (
              <span
                key={c!.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background-elevated/60 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="truncate max-w-[12rem]">{c!.title}</span>
              </span>
            ))}
            {courses.length > 3 && (
              <span className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
                +{courses.length - 3} more
              </span>
            )}
          </div>
        </div>

        <dl className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ClockIcon width={14} height={14} />
            <dd>~{path.estimatedHours}h</dd>
          </div>
          <dd>{courses.length} courses</dd>
        </dl>

        <div className="mt-5">
          <Link
            href={`/paths/${path.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Explore path
            <ArrowRightIcon width={14} height={14} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
