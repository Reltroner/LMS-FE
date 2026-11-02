"use client";

import { useId, useMemo, useState } from "react";
import type { Course, CourseCategory, CourseLevel } from "@/types/course";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { CourseCard, categoryLabels, levelLabels, type CourseInventory } from "./CourseCard";

type SortKey = "relevance" | "title" | "available";
type Inventories = Readonly<Record<string, CourseInventory>>;
export type CatalogFilters = Readonly<{
  query: string; category: CourseCategory | "all"; level: CourseLevel | "all"; availableOnly: boolean; sort: SortKey;
}>;

const noFilters: CatalogFilters = { query: "", category: "all", level: "all", availableOnly: false, sort: "relevance" };
const selectClass = "h-11 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

// Discovery controls follow the published inventory: a single course needs none, and each filter
// appears only when it has at least two values to tell apart, so no control is decoration.
export function catalogControls(courses: readonly Course[], inventories: Inventories) {
  const many = courses.length > 1;
  const counts = courses.map((course) => inventories[course.slug].availableLessonCount);
  const categories = [...new Set(courses.map((course) => course.category))];
  const levels = [...new Set(courses.map((course) => course.level))];
  return {
    search: many,
    categories: categories.length > 1 ? categories : [],
    levels: levels.length > 1 ? levels : [],
    availableToggle: counts.some((n) => n === 0) && counts.some((n) => n > 0),
    sort: many,
    sortByAvailable: new Set(counts).size > 1,
  };
}

export function filterCourses(courses: readonly Course[], inventories: Inventories, filters: CatalogFilters) {
  const q = filters.query.trim().toLowerCase();
  const list = courses.filter((c) =>
    (filters.category === "all" || c.category === filters.category) &&
    (filters.level === "all" || c.level === filters.level) &&
    (!filters.availableOnly || inventories[c.slug].availableLessonCount > 0) &&
    (!q || `${c.title} ${c.subtitle} ${c.summary} ${c.modules.map((m) => m.title).join(" ")}`.toLowerCase().includes(q)));
  if (filters.sort === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (filters.sort === "available") {
    return [...list].sort((a, b) => inventories[b.slug].availableLessonCount - inventories[a.slug].availableLessonCount);
  }
  return list;
}

// Filters run over the published catalog only; inventories are computed at build time.
export function CourseCatalog({ courses, inventories }: { courses: readonly Course[]; inventories: Inventories }) {
  if (courses.length === 0) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-lg font-semibold text-foreground">No courses are published yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Courses appear here once their first lesson is reviewed and published.</p>
      </Card>
    );
  }
  // One course is shown as itself: no search, filters, sorting, or result count over a list of one.
  if (courses.length === 1) {
    return <CourseCard course={courses[0]} inventory={inventories[courses[0].slug]} layout="row" />;
  }
  return <FilterableCatalog courses={courses} inventories={inventories} />;
}

function FilterableCatalog({ courses, inventories }: { courses: readonly Course[]; inventories: Inventories }) {
  const id = useId();
  const [filters, setFilters] = useState<CatalogFilters>(noFilters);
  const controls = catalogControls(courses, inventories);
  const filtered = useMemo(() => filterCourses(courses, inventories, filters), [courses, inventories, filters]);
  const set = (change: Partial<CatalogFilters>) => setFilters((current) => ({ ...current, ...change }));
  const filtersActive = filters.query !== "" || filters.category !== "all" || filters.level !== "all" || filters.availableOnly;
  const reset = () => setFilters((current) => ({ ...noFilters, sort: current.sort }));

  return (
    <div className="space-y-6">
      <Card tone="muted" className="space-y-4 p-4 sm:p-5">
        <Input type="search" placeholder="Search courses by topic or question…" value={filters.query}
          onChange={(e) => set({ query: e.target.value })} icon={<SearchIcon width={18} height={18} />}
          aria-label="Search courses" maxLength={120} />
        <div className="flex flex-wrap items-center gap-3">
          {controls.categories.length > 0 && (
            <>
              <label className="sr-only" htmlFor={`${id}-topic`}>Topic</label>
              <select id={`${id}-topic`} value={filters.category} onChange={(e) => set({ category: e.target.value as CourseCategory | "all" })} className={selectClass}>
                <option value="all">All topics</option>
                {controls.categories.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
              </select>
            </>
          )}
          {controls.levels.length > 0 && (
            <>
              <label className="sr-only" htmlFor={`${id}-level`}>Level</label>
              <select id={`${id}-level`} value={filters.level} onChange={(e) => set({ level: e.target.value as CourseLevel | "all" })} className={selectClass}>
                <option value="all">All levels</option>
                {controls.levels.map((l) => <option key={l} value={l}>{levelLabels[l]}</option>)}
              </select>
            </>
          )}
          {controls.availableToggle && (
            <button type="button" aria-pressed={filters.availableOnly} onClick={() => set({ availableOnly: !filters.availableOnly })}
              className={cn("h-11 rounded-full border px-4 text-sm font-semibold transition",
                filters.availableOnly ? "border-success bg-success-soft text-success" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
              Available now
            </button>
          )}
          <label className="sr-only" htmlFor={`${id}-sort`}>Sort</label>
          <select id={`${id}-sort`} value={filters.sort} onChange={(e) => set({ sort: e.target.value as SortKey })} className={cn(selectClass, "sm:ml-auto")}>
            <option value="relevance">Sort: Recommended</option>
            <option value="title">Sort: Title A–Z</option>
            {controls.sortByAvailable && <option value="available">Sort: Most lessons available</option>}
          </select>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p role="status" className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {courses.length} published courses
        </p>
        {filtersActive && (
          <button type="button" onClick={reset} className="font-semibold text-primary underline-offset-2 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">Nothing matches these filters</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every published course is still here — try another word, or clear the filters.
          </p>
          <button type="button" onClick={reset} className="mt-5 text-sm font-semibold text-primary hover:underline">Clear filters</button>
        </Card>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {filtered.map((course) => (
            <li key={course.id}><CourseCard course={course} inventory={inventories[course.slug]} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
