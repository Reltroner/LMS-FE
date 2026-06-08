import type { CourseLevel, CourseStatus } from "@/types/course";
import type { LessonKind } from "@/types/lesson";

export const validCourseStatuses = ["draft", "published", "archived"] as const;
export const validCourseLevels = [
  "beginner",
  "beginner-intermediate",
  "intermediate",
  "advanced",
] as const;
export const validLessonKinds = ["lesson", "lab", "checkpoint", "capstone"] as const;

export function isCourseStatus(value: string): value is CourseStatus {
  return validCourseStatuses.includes(value as CourseStatus);
}

export function isCourseLevel(value: string): value is CourseLevel {
  return validCourseLevels.includes(value as CourseLevel);
}

export function isLessonKind(value: string): value is LessonKind {
  return validLessonKinds.includes(value as LessonKind);
}
