import type { CourseModule } from "@/types/module";

export type CourseStatus = "draft" | "published" | "archived";
export type CourseLevel = "beginner" | "beginner-intermediate" | "intermediate" | "advanced";
export type CourseCategory = "backend-engineering" | "worldbuilding" | "creative-system";

export type Course = Readonly<{
  id: string;
  slug: string;
  aliases?: readonly string[];
  title: string;
  subtitle: string;
  summary: string;
  category: CourseCategory;
  level: CourseLevel;
  status: CourseStatus;
  estimatedHours: number;
  pathSlugs: readonly string[];
  prerequisiteCourseSlugs?: readonly string[];
  finalDeliverable?: string;
  authorSlug?: string;
  modules: readonly CourseModule[];
}>;
