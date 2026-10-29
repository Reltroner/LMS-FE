import Link from "next/link";
import type { Course } from "@/types/course";
import { lessonRoute } from "@/lib/routes/route-builders";
import { cn } from "@/lib/utils/cn";

// The course outline beside (or above, on small screens) the lesson. The current module lists
// every syllabus lesson; only published ones are links, the rest are marked planned.
export function LessonCurriculumNav({ course, currentSlug, titles }: {
  course: Course;
  currentSlug: string;
  titles: Readonly<Record<string, string>>;
}) {
  return (
    <ol className="space-y-4">
      {course.modules.map((module, index) => {
        const entries = module.syllabus ??
          module.lessonSlugs.map((slug) => ({ number: "", title: titles[slug] ?? slug, lessonSlug: slug }));
        const isCurrentModule = entries.some((entry) => entry.lessonSlug === currentSlug);
        const available = entries.filter((entry) => entry.lessonSlug).length;
        return (
          <li key={module.id}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Module {String(index + 1).padStart(2, "0")} · {module.title}
            </p>
            {isCurrentModule ? (
              <ul className="mt-2 space-y-0.5">
                {entries.map((entry) => {
                  const active = entry.lessonSlug === currentSlug;
                  const label = <>{entry.number && <span className="mr-1.5 tabular-nums">{entry.number}</span>}{entry.title}</>;
                  return (
                    <li key={`${entry.number}-${entry.title}`}>
                      {entry.lessonSlug ? (
                        <Link href={lessonRoute(course.slug, entry.lessonSlug)} aria-current={active ? "page" : undefined}
                          className={cn("block rounded-lg px-3 py-2 text-sm leading-5 transition",
                            active ? "bg-primary-soft font-semibold text-primary" : "text-foreground hover:bg-background-elevated")}>
                          {label}
                        </Link>
                      ) : (
                        <span className="block px-3 py-1.5 text-sm leading-5 text-muted-foreground">
                          {label} <span className="whitespace-nowrap text-xs">· Planned</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-1 px-3 text-xs text-muted-foreground">
                {available ? `${available} of ${entries.length} lessons available` : `${entries.length} planned lessons`}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
