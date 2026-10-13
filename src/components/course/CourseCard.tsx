import Link from "next/link";
import type { Course } from "@/types/course";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ClockIcon, LayersIcon, BookIcon } from "@/components/ui/icons";
import { getLessonsByCourseSlug } from "@/lib/fixtures/lessons";

const categoryLabels: Record<string, string> = {
  "backend-engineering": "Backend Engineering",
  worldbuilding: "Worldbuilding",
  "creative-system": "Creative System",
};

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  "beginner-intermediate": "Beginner → Intermediate",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function CourseCard({ course }: { course: Course }) {
  const lessons = getLessonsByCourseSlug(course.slug);
  const totalMinutes = lessons.reduce((sum, l) => sum + l.durationMinutes, 0);
  const hours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <Card as="article" interactive className="flex flex-col overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/80 backdrop-blur">
            <BookIcon width={28} height={28} className="text-primary" />
          </span>
        </div>
        <div className="absolute left-4 top-4">
          <Badge tone="primary">{categoryLabels[course.category]}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{levelLabels[course.level]}</Badge>
          {course.isSynthetic ? (
            <Badge tone="neutral">Prototype Mock</Badge>
          ) : (
            <Badge tone={course.status === "published" ? "success" : "warning"}>
              {course.status}
            </Badge>
          )}
        </div>

        <h3 className="mt-3 text-lg font-semibold text-foreground">
          <Link
            href={`/courses/${course.slug}`}
            className="hover:text-primary"
          >
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {course.summary}
        </p>

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <LayersIcon width={14} height={14} />
            <dd>{course.modules.length} modules</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <BookIcon width={14} height={14} />
            <dd>{lessons.length} lessons</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon width={14} height={14} />
            <dd>{hours || course.estimatedHours}h</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3">
          <span className="text-[11px] font-medium text-muted-foreground">
            {lessons.length > 0 ? `${lessons.length} lessons ready` : "Syllabus ready"}
          </span>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View course
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
