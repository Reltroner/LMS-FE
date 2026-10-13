export const courseLevelOptions = [
  { label: "All levels", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Beginner Intermediate", value: "beginner-intermediate" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
] as const;

export const courseSortOptions = [
  { label: "Title A-Z", value: "title-asc" },
  { label: "Title Z-A", value: "title-desc" },
  { label: "Duration Low to High", value: "duration-asc" },
  { label: "Duration High to Low", value: "duration-desc" },
] as const;

export type CourseLevelFilterValue = (typeof courseLevelOptions)[number]["value"];
export type CourseSortValue = (typeof courseSortOptions)[number]["value"];

type CourseFiltersProps = {
  selectedLevel: CourseLevelFilterValue;
  selectedSort: CourseSortValue;
  visibleCourseCount: number;
  totalCourseCount: number;
  isPending: boolean;
  onLevelChange: (level: CourseLevelFilterValue) => void;
  onSortChange: (sort: CourseSortValue) => void;
};

export function CourseFilters({
  selectedLevel,
  selectedSort,
  visibleCourseCount,
  totalCourseCount,
  isPending,
  onLevelChange,
  onSortChange,
}: CourseFiltersProps) {
  const hasActiveFilter = selectedLevel !== "all";
  const courseLabel = visibleCourseCount === 1 ? "course" : "courses";

  return (
    <div className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Catalog controls
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Filter by Level</h3>
          </div>
          <fieldset className="space-y-2.5">
            <legend className="sr-only">Filter courses by level</legend>
            <div className="flex flex-wrap gap-2" aria-label="Filter courses by level" role="group">
              {courseLevelOptions.map((option) => {
                const isSelected = option.value === selectedLevel;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onLevelChange(option.value)}
                    className={
                      isSelected
                        ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        : "rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
        <div className="space-y-2">
          <label htmlFor="course-sort" className="block text-sm font-semibold text-foreground">
            Sort by
          </label>
          <div className="relative">
            <select
              id="course-sort"
              value={selectedSort}
              onChange={(event) => onSortChange(event.target.value as CourseSortValue)}
              className="min-h-11 w-full min-w-0 appearance-none rounded-2xl border border-border bg-background px-4 py-2.5 pr-10 text-sm font-medium text-foreground transition hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-w-[15rem]"
            >
              {courseSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
        <p aria-live="polite">
          Showing <span className="font-semibold text-foreground">{visibleCourseCount}</span> of{" "}
          <span className="font-semibold text-foreground">{totalCourseCount}</span> {courseLabel}
          {hasActiveFilter ? " with selected filter." : "."}
        </p>
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-primary">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
            Updating catalog...
          </span>
        ) : null}
      </div>
    </div>
  );
}
