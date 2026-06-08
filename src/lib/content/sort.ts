import type { Course } from "@/types/course";
import type { LearningPath } from "@/types/path";

export function sortCoursesByTitle(courses: readonly Course[]): Course[] {
  return [...courses].sort((leftCourse, rightCourse) =>
    leftCourse.title.localeCompare(rightCourse.title),
  );
}

export function sortPathsByTitle(paths: readonly LearningPath[]): LearningPath[] {
  return [...paths].sort((leftPath, rightPath) => leftPath.title.localeCompare(rightPath.title));
}
