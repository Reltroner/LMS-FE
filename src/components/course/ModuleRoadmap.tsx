import Link from "next/link";
import type { Course } from "@/types/course";
import { lessonRoute } from "@/lib/routes/route-builders";
import { AvailabilityBadge } from "./AvailabilityBadge";

// The course's modules in order, each with its real availability: published lessons link to
// the reader; planned lessons are counted, never presented as locked or available.
export function ModuleRoadmap({ course, showLessons = false, compact = false }: {
  course: Course; showLessons?: boolean; compact?: boolean;
}) {
  return (
    <ol className={`relative border-l-2 border-border pl-6 ${compact ? "space-y-3" : "space-y-5"}`}>
      {course.modules.map((module, index) => {
        const syllabus = module.syllabus ?? module.lessonSlugs.map((slug) => ({ number: "", title: slug, lessonSlug: slug }));
        const available = syllabus.filter((entry) => entry.lessonSlug);
        const number = String(index + 1).padStart(2, "0");
        return (
          <li key={module.id} className="relative">
            <span aria-hidden="true"
              className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-[3px] bg-card ${available.length ? "border-success" : "border-cyan"}`} />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-semibold text-foreground">
                <span className="text-muted-foreground">Module {number} · </span>{module.title}
              </h3>
              <AvailabilityBadge available={available.length > 0}
                label={available.length ? `${available.length} of ${syllabus.length} available` : "Planned"} />
            </div>
            {!compact && (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {module.summary}{" "}
                {!available.length && <span>{syllabus.length} planned lessons; none published yet.</span>}
              </p>
            )}
            {showLessons && available.length > 0 && (
              <ul className="mt-2 space-y-1">
                {available.map((entry) => (
                  <li key={entry.lessonSlug}>
                    <Link href={lessonRoute(course.slug, entry.lessonSlug!)}
                      className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
                      {entry.number && `${entry.number} — `}{entry.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
