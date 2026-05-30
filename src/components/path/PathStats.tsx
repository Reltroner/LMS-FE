type PathStatsProps = {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalDurationHours: number;
  ariaLabel?: string;
  className?: string;
};

const statCards = [
  { key: "courses", label: "Total courses" },
  { key: "modules", label: "Total modules" },
  { key: "lessons", label: "Total lessons" },
  { key: "duration", label: "Total duration" },
] as const;

export function PathStats({
  totalCourses,
  totalModules,
  totalLessons,
  totalDurationHours,
  ariaLabel = "Learning path statistics",
  className,
}: PathStatsProps) {
  const values = {
    courses: totalCourses,
    modules: totalModules,
    lessons: totalLessons,
    duration: `${totalDurationHours}h`,
  } as const;

  return (
    <dl className={`grid gap-4 sm:grid-cols-2 ${className ?? ""}`.trim()} aria-label={ariaLabel}>
      {statCards.map((statCard) => (
        <div
          key={statCard.key}
          className="rounded-3xl border border-zinc-200 bg-white/90 px-5 py-5 shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] backdrop-blur-sm"
        >
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {statCard.label}
          </dt>
          <dd className="mt-3 text-3xl font-semibold tracking-normal text-zinc-950">
            {values[statCard.key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
