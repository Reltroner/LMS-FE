"use client";

import { useId, useMemo, useState } from "react";
import type { Course, CourseCategory, CourseLevel } from "@/types/course";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { CourseCard, categoryLabels, levelLabels, type CourseInventory } from "./CourseCard";

type SortKey = "relevance" | "title" | "available";
const selectClass = "h-11 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

// Filters run over the published catalog only; inventories are computed at build time.
export function CourseCatalog({ courses, inventories }: {
  courses: readonly Course[];
  inventories: Readonly<Record<string, CourseInventory>>;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CourseCategory | "all">("all");
  const [level, setLevel] = useState<CourseLevel | "all">("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  const categories = [...new Set(courses.map((c) => c.category))];
  const levels = [...new Set(courses.map((c) => c.level))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((c) =>
      (category === "all" || c.category === category) &&
      (level === "all" || c.level === level) &&
      (!availableOnly || inventories[c.slug].availableLessonCount > 0) &&
      (!q || `${c.title} ${c.subtitle} ${c.summary} ${c.modules.map((m) => m.title).join(" ")}`.toLowerCase().includes(q)));
    if (sort === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "available") {
      return [...list].sort((a, b) => inventories[b.slug].availableLessonCount - inventories[a.slug].availableLessonCount);
    }
    return list;
  }, [courses, inventories, query, category, level, availableOnly, sort]);

  const filtersActive = query !== "" || category !== "all" || level !== "all" || availableOnly;
  const reset = () => { setQuery(""); setCategory("all"); setLevel("all"); setAvailableOnly(false); };

  if (courses.length === 0) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-lg font-semibold text-foreground">No courses are published yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Courses appear here once their first lesson is reviewed and published.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-4 sm:p-5">
        <Input type="search" placeholder="Search courses by topic or question…" value={query}
          onChange={(e) => setQuery(e.target.value)} icon={<SearchIcon width={18} height={18} />}
          aria-label="Search courses" maxLength={120} />
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor={`${id}-topic`}>Topic</label>
          <select id={`${id}-topic`} value={category} onChange={(e) => setCategory(e.target.value as CourseCategory | "all")} className={selectClass}>
            <option value="all">All topics</option>
            {categories.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
          </select>
          <label className="sr-only" htmlFor={`${id}-level`}>Level</label>
          <select id={`${id}-level`} value={level} onChange={(e) => setLevel(e.target.value as CourseLevel | "all")} className={selectClass}>
            <option value="all">All levels</option>
            {levels.map((l) => <option key={l} value={l}>{levelLabels[l]}</option>)}
          </select>
          <button type="button" aria-pressed={availableOnly} onClick={() => setAvailableOnly((v) => !v)}
            className={cn("h-11 rounded-full border px-4 text-sm font-semibold transition",
              availableOnly ? "border-success bg-success-soft text-success" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
            Available now
          </button>
          <label className="sr-only" htmlFor={`${id}-sort`}>Sort</label>
          <select id={`${id}-sort`} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={cn(selectClass, "sm:ml-auto")}>
            <option value="relevance">Sort: Recommended</option>
            <option value="title">Sort: Title A–Z</option>
            <option value="available">Sort: Most lessons available</option>
          </select>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p role="status" className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {courses.length} published{" "}
          {courses.length === 1 ? "course" : "courses"}
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
            The published course is still here — try another word, or clear the filters.
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
