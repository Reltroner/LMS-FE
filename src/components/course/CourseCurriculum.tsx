import Link from "next/link";
import type { Course, Lesson } from "@/types/course";
import { ChevronDownIcon, ClockIcon } from "@/components/ui/icons";
import { lessonRoute } from "@/lib/routes/route-builders";
import { AvailabilityBadge } from "./AvailabilityBadge";

// Module accordion built on <details>/<summary>: keyboard and screen-reader support come from
// the platform and it works before JavaScript loads. Published lessons link; planned ones never do.
export function CourseCurriculum({ course, lessons }: { course: Course; lessons: readonly Lesson[] }) {
  const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  return (
    <div className="space-y-3">
      {course.modules.map((module, index) => {
        const entries = module.syllabus ??
          module.lessonSlugs.map((slug) => ({ number: "", title: bySlug.get(slug)?.title ?? slug, lessonSlug: slug }));
        const available = entries.filter((entry) => entry.lessonSlug).length;
        return (
          <details key={module.id} open={available > 0}
            className="group rounded-2xl border border-border bg-card shadow-sm open:shadow">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 transition hover:bg-background-elevated [&::-webkit-details-marker]:hidden">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{module.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {available ? `${available} of ${entries.length} lessons available` : `${entries.length} planned lessons`}
                </span>
              </span>
              <AvailabilityBadge available={available > 0} label={available ? "Available now" : "Planned"} />
              <ChevronDownIcon width={18} height={18} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border px-5 pb-4 pt-3">
              <p className="text-sm leading-6 text-muted-foreground">{module.summary}</p>
              <ol className="mt-3 space-y-1">
                {entries.map((entry) => {
                  const lesson = entry.lessonSlug ? bySlug.get(entry.lessonSlug) : undefined;
                  const label = <>{entry.number && <span className="tabular-nums text-muted-foreground">{entry.number}</span>} {entry.title}</>;
                  return (
                    <li key={`${entry.number}-${entry.title}`}
                      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl px-3 py-2 text-sm odd:bg-background-elevated/60">
                      {lesson ? (
                        <Link href={lessonRoute(course.slug, lesson.slug)} className="font-semibold text-primary underline-offset-2 hover:underline">
                          {label}
                        </Link>
                      ) : (
                        <span className="text-foreground">{label}</span>
                      )}
                      <span className="flex items-center gap-2">
                        {lesson && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ClockIcon width={12} height={12} /> {lesson.durationMinutes} min
                          </span>
                        )}
                        <AvailabilityBadge available={Boolean(lesson)} />
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </details>
        );
      })}
    </div>
  );
}
