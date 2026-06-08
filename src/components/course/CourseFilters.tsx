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
    <div className="space-y-5 rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Catalog controls
            </p>
            <h3 className="text-2xl font-semibold tracking-normal text-foreground">
              Explore courses
            </h3>
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-muted-foreground">Filter by level</legend>
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
                        ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                        : "rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
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
          <label htmlFor="course-sort" className="block text-sm font-medium text-muted-foreground">
            Sort by
          </label>
          <select
            id="course-sort"
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value as CourseSortValue)}
            className="min-h-12 w-full min-w-0 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:min-w-[15rem]"
          >
            {courseSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing {visibleCourseCount} of {totalCourseCount} {courseLabel}
        {hasActiveFilter ? " with the selected level filter." : "."}
        {isPending ? (
          <span className="ml-2 font-medium text-foreground">Updating catalog...</span>
        ) : null}
      </p>
    </div>
  );
}
