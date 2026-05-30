import type { CourseLevel } from "@/types/course";

export type LearningPath = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
  level: CourseLevel;
  estimatedHours: number;
  courseSlugs: readonly string[];
}>;
