type CourseStatsProps = {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
};

export function CourseStats({ totalCourses, totalModules, totalLessons }: CourseStatsProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1" aria-label="Course catalog statistics">
      <div className="rounded-3xl border border-zinc-200 bg-white/90 px-5 py-5 shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] backdrop-blur-sm">
        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Total courses
        </dt>
        <dd className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
          {totalCourses}
        </dd>
      </div>
      <div className="rounded-3xl border border-zinc-200 bg-white/90 px-5 py-5 shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] backdrop-blur-sm">
        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Total modules
        </dt>
        <dd className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
          {totalModules}
        </dd>
      </div>
      <div className="rounded-3xl border border-zinc-200 bg-white/90 px-5 py-5 shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] backdrop-blur-sm">
        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Total lessons
        </dt>
        <dd className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
          {totalLessons}
        </dd>
      </div>
    </dl>
  );
}
