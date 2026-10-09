import { courses } from "@/catalog/courses";
import type { Course } from "@/types/course";
import { allLessons } from "@/lib/content/contentlayer";

const originalCourses = courses as readonly Course[];
const publishedLessonKeys = new Set(
  allLessons.filter((lesson) => lesson.status === "published")
    .map((lesson) => `${lesson.courseSlug}/${lesson.slug}`),
);
const courseList: readonly Course[] = originalCourses.map((course) => ({
  ...course,
  modules: course.modules.map((module) => ({
    ...module,
    lessonSlugs: module.lessonSlugs.filter(
      (slug) => publishedLessonKeys.has(`${course.slug}/${slug}`),
    ),
  })).filter((module) => module.lessonSlugs.length > 0),
}));

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
