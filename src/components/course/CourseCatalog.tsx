"use client";

import { useMemo, useState } from "react";
import type { Course, CourseCategory, CourseLevel } from "@/types/course";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SearchIcon, FilterIcon, XIcon } from "@/components/ui/icons";
import { CourseCard } from "./CourseCard";
import { cn } from "@/lib/utils/cn";

const categories: { value: CourseCategory | "all"; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "worldbuilding", label: "Worldbuilding" },
  { value: "creative-system", label: "Creative System" },
];

const levels: { value: CourseLevel | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "beginner-intermediate", label: "Beginner → Intermediate" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

type SortKey = "relevance" | "title" | "hours-asc" | "hours-desc";

export function CourseCatalog({ courses }: { courses: readonly Course[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CourseCategory | "all">("all");
  const [level, setLevel] = useState<CourseLevel | "all">("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = courses.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (level !== "all" && c.level !== level) return false;
      if (q) {
        const haystack = `${c.title} ${c.subtitle} ${c.summary}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "title":
          return a.title.localeCompare(b.title);
        case "hours-asc":
          return a.estimatedHours - b.estimatedHours;
        case "hours-desc":
          return b.estimatedHours - a.estimatedHours;
        default:
          return 0;
      }
    });
    return list;
  }, [courses, query, category, level, sort]);

  const hasActiveFilters =
    query !== "" || category !== "all" || level !== "all";

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search courses by title, summary, or tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<SearchIcon width={18} height={18} />}
              aria-label="Search courses"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 lg:hidden"
              aria-expanded={filtersOpen}
            >
              <FilterIcon width={16} height={16} />
              Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-12 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              aria-label="Sort courses"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="title">Sort: Title A–Z</option>
              <option value="hours-asc">Sort: Shortest first</option>
              <option value="hours-desc">Sort: Longest first</option>
            </select>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-3 pt-4 lg:grid-cols-2",
            !filtersOpen && "hidden lg:grid",
          )}
        >
          <FilterGroup
            label="Category"
            options={categories}
            value={category}
            onChange={(v) => setCategory(v as CourseCategory | "all")}
          />
          <FilterGroup
            label="Level"
            options={levels}
            value={level}
            onChange={(v) => setLevel(v as CourseLevel | "all")}
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {query && (
              <ActiveChip label={`“${query}”`} onClear={() => setQuery("")} />
            )}
            {category !== "all" && (
              <ActiveChip
                label={categories.find((c) => c.value === category)?.label ?? ""}
                onClear={() => setCategory("all")}
              />
            )}
            {level !== "all" && (
              <ActiveChip
                label={levels.find((l) => l.value === level)?.label ?? ""}
                onClear={() => setLevel("all")}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setLevel("all");
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          of {courses.length} published courses
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background-elevated">
            <SearchIcon width={26} height={26} className="text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No courses match your filters
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try clearing filters or searching for a different term.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setLevel("all");
            }}
            className="mt-5 text-sm font-semibold text-primary hover:underline"
          >
            Reset filters
          </button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <Badge tone="neutral" className="mr-2">Prototype</Badge>
        Search and filtering are local mock interactions. Draft courses are
        intentionally excluded from this public view.
      </p>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            value === opt.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
          )}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ActiveChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter ${label}`}
        className="ml-0.5 hover:text-foreground"
      >
        <XIcon width={12} height={12} />
      </button>
    </span>
  );
}
