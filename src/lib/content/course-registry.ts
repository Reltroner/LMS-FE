import { courses } from "@/catalog/courses";
import type { Course } from "@/types/course";

const courseList = courses as readonly Course[];

export function getAllCourses(): readonly Course[] {
  return courseList;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courseList.find((course) => course.slug === slug);
}

export function getCourseBySlugOrAlias(slug: string): Course | undefined {
  return courseList.find((course) => course.slug === slug || course.aliases?.includes(slug));
}

export function getCourseRouteSlugs(course: Course): readonly string[] {
  return [course.slug, ...(course.aliases ?? [])];
}

export function getAllCourseRouteSlugs(): readonly string[] {
  return courseList.flatMap((course) => getCourseRouteSlugs(course));
}
