export type CourseStatus = "draft" | "published" | "archived";
export type CourseLevel =
  | "beginner"
  | "beginner-intermediate"
  | "intermediate"
  | "advanced";
export type CourseCategory =
  | "worldbuilding"
  | "creative-system";

// One planned syllabus lesson. lessonSlug is present only when that lesson is published.
export type SyllabusEntry = Readonly<{
  number: string;
  title: string;
  lessonSlug?: string;
}>;

export type CourseModule = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  lessonSlugs: readonly string[];
  syllabus?: readonly SyllabusEntry[];
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

// Pinned file in an approved GitHub resource repository, delivered through jsDelivr.
export type LessonMediaAsset = Readonly<{
  provider: "github-cdn";
  repository: string;
  revision: string;
  path: string;
}>;

// Optional alternative formats of one lesson; Reading is always the MDX body.
export type LessonMedia = Readonly<{
  video?: Readonly<{ provider: "youtube"; videoId: string }>;
  audio?: Readonly<{ provider: "spotify"; episodeId: string }>;
  slides?: LessonMediaAsset & Readonly<{ format: "pdf" }>;
  infographic?: LessonMediaAsset &
    Readonly<{ format: "png"; alt: string; width: number; height: number }>;
}>;

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
  media?: LessonMedia;
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
