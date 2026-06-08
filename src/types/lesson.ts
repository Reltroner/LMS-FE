import type { CourseLevel, CourseStatus } from "@/types/course";

export type LessonKind = "lesson" | "lab" | "checkpoint" | "capstone";
export type LessonStatus = CourseStatus;
export type LessonLevel = CourseLevel;

export type Lesson = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  kind: LessonKind;
  status: LessonStatus;
  level: LessonLevel;
  durationMinutes: number;
  objectives: readonly string[];
  outputs: readonly string[];
  tags: readonly string[];
  resourceIds?: readonly string[];
}>;
