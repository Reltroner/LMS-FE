import type { Course, CourseLevel } from "@/types/course";
import type { LearningPath } from "@/types/path";

export function getPublishedCourses(courses: readonly Course[]) {
  return courses.filter((course) => course.status === "published");
}

export function getPublishedPaths(paths: readonly LearningPath[]) {
  return paths.filter((path) => path.status === "published");
}

export function formatLevelLabel(level: CourseLevel | "beginner-to-intermediate") {
  return level
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
