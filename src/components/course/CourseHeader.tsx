import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatLevelLabel } from "@/lib/content/filters";
import type { Course } from "@/types/course";

type CourseHeaderProps = {
  course: Course;
  lessonCount?: number;
};

function formatCategoryLabel(category: Course["category"]) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function CourseHeader({ course, lessonCount }: CourseHeaderProps) {
  const totalLessons =
    lessonCount ??
    course.modules.reduce((total, courseModule) => total + courseModule.lessonSlugs.length, 0);

  return (
    <header className="overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_38%),linear-gradient(135deg,#ffffff,#f8fbff)] p-6 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge tone="primary">{formatLevelLabel(course.level)}</Badge>
            <Badge tone={course.status === "published" ? "success" : "warning"}>
              {course.status}
            </Badge>
            <Badge tone="accent">{formatCategoryLabel(course.category)}</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              {course.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{course.subtitle}</p>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            ["Duration", `${course.estimatedHours} hours`],
            ["Modules", course.modules.length],
            ["Lessons", totalLessons],
            ["Deliverable", course.finalDeliverable ?? "Course project"],
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

      <section aria-labelledby="course-outcomes-title" className="mt-8 border-t border-border pt-8">
        <h2 id="course-outcomes-title" className="text-2xl font-semibold text-foreground">
          Outcomes
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {course.modules.slice(0, 3).map((courseModule) => (
            <Card key={courseModule.id} className="p-4 shadow-none">
              <p className="text-sm font-semibold text-foreground">{courseModule.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{courseModule.summary}</p>
            </Card>
          ))}
        </div>
      </section>
    </header>
  );
}
