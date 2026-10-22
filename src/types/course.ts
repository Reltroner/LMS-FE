export type CourseStatus = "draft" | "published" | "archived";
export type CourseLevel =
  | "beginner"
  | "beginner-intermediate"
  | "intermediate"
  | "advanced";
export type CourseCategory =
  | "backend-engineering"
  | "worldbuilding"
  | "creative-system";

export type CourseModule = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  lessonSlugs: readonly string[];
}>;

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
  isSynthetic?: boolean;
  estimatedHours: number;
  pathSlugs: readonly string[];
  prerequisiteCourseSlugs?: readonly string[];
  finalDeliverable?: string;
  authorSlug?: string;
  objectives?: readonly string[];
  modules: readonly CourseModule[];
}>;

export type LessonKind = "lesson" | "lab" | "checkpoint" | "capstone";

export type Lesson = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  kind: LessonKind;
  status: CourseStatus;
  level: CourseLevel;
  durationMinutes: number;
  objectives: readonly string[];
  outputs: readonly string[];
  tags: readonly string[];
  resourceIds?: readonly string[];
}>;

export type ResourceType =
  | "download"
  | "external-link"
  | "pdf"
  | "video"
  | "slide-deck"
  | "diagram";

export type Resource = Readonly<{
  id: string;
  courseSlug: string;
  type: ResourceType;
  title: string;
  summary: string;
  url: string;
  filename?: string;
}>;
