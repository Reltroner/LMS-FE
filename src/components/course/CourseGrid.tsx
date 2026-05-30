"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { CourseCard } from "@/components/course/CourseCard";
import {
  CourseFilters,
  courseLevelOptions,
  courseSortOptions,
  type CourseLevelFilterValue,
  type CourseSortValue,
} from "@/components/course/CourseFilters";
import { CourseEmptyState } from "@/components/course/CourseEmptyState";
import type { Course } from "@/types/course";

const levelMap = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

const defaultSortValue = courseSortOptions[0].value;

type CourseGridProps = {
  courses: readonly Course[];
};

function normalizeLevelParam(value: string | null): CourseLevelFilterValue {
  const normalizedValue = value?.toLowerCase();

  if (normalizedValue && courseLevelOptions.some((option) => option.value === normalizedValue)) {
    return normalizedValue as CourseLevelFilterValue;
  }

  return "all";
}

function normalizeSortParam(value: string | null): CourseSortValue {
  if (value && courseSortOptions.some((option) => option.value === value)) {
    return value as CourseSortValue;
  }

  return defaultSortValue;
}

function sortCourses(courses: readonly Course[], sort: CourseSortValue): Course[] {
  return [...courses].sort((leftCourse, rightCourse) => {
    if (sort === "title-desc") {
      return rightCourse.title.localeCompare(leftCourse.title);
    }

    if (sort === "duration-asc") {
      return leftCourse.estimatedHours - rightCourse.estimatedHours;
    }

    if (sort === "duration-desc") {
      return rightCourse.estimatedHours - leftCourse.estimatedHours;
    }

    return leftCourse.title.localeCompare(rightCourse.title);
  });
}

export function CourseGrid({ courses }: CourseGridProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedLevel = normalizeLevelParam(searchParams.get("level"));
  const selectedSort = normalizeSortParam(searchParams.get("sort"));
  const filteredCourses = courses.filter((course) => {
    if (selectedLevel === "all") {
      return true;
    }

    return course.level === levelMap[selectedLevel];
  });
  const visibleCourses = sortCourses(filteredCourses, selectedSort);

  function updateCatalogSearchParams(level: CourseLevelFilterValue, sort: CourseSortValue) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (level === "all") {
      nextSearchParams.delete("level");
    } else {
      nextSearchParams.set("level", level);
    }

    if (sort === defaultSortValue) {
      nextSearchParams.delete("sort");
    } else {
      nextSearchParams.set("sort", sort);
    }

    const queryString = nextSearchParams.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  return (
    <div className="space-y-6">
      <CourseFilters
        selectedLevel={selectedLevel}
        selectedSort={selectedSort}
        visibleCourseCount={visibleCourses.length}
        totalCourseCount={courses.length}
        isPending={isPending}
        onLevelChange={(level) => updateCatalogSearchParams(level, selectedSort)}
        onSortChange={(sort) => updateCatalogSearchParams(selectedLevel, sort)}
      />
      <div aria-busy={isPending} aria-live="polite">
        {visibleCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <CourseEmptyState />
        )}
      </div>
    </div>
  );
}
