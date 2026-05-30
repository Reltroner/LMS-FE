import type { CourseModule } from "@/types/module";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type Course = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
  level: CourseLevel;
  estimatedHours: number;
  modules: readonly CourseModule[];
}>;
