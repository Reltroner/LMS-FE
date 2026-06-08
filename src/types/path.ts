import type { CourseStatus } from "@/types/course";

export type PathLevel = "beginner" | "beginner-to-intermediate" | "intermediate" | "advanced";

export type LearningPath = Readonly<{
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  level: PathLevel;
  status: CourseStatus;
  estimatedHours: number;
  courseSlugs: readonly string[];
}>;
