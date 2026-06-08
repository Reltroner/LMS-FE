export type CourseModule = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  lessonSlugs: readonly string[];
}>;

export type CourseModuleWithLessons<LessonItem> = CourseModule &
  Readonly<{
    order: number;
    lessons: readonly LessonItem[];
  }>;
